import shutil
import os
import pathlib
import json
import re


def main() -> None:
    # create folder "target/www" and copy public into it
    shutil.rmtree("target/main.js", ignore_errors=True)
    shutil.rmtree("target/public", ignore_errors=True)
    if not os.path.exists("target"):
        os.mkdir("target")
    
    shutil.copyfile("compiler/template/package.json", "target/package.json")
    shutil.copytree("public", "target/public")

    www = getWWW()
    compiler = Compiler()
    code = compiler.compile(www)

    with open("compiler/template/main.js", "r") as templateFile:
        template = templateFile.read()
        with open("target/main.js", "w") as exportFile:
            exportFile.write(template.replace("/*{{Paths}}*/", code))


def getWWW(path="www") -> list[pathlib.PosixPath]:
    paths = []
    for path in pathlib.Path(path).iterdir():
        if path.is_dir():
            paths += getWWW(str(path))
        if path.is_file():
            paths.append(path)
    return paths


class PocketbaseFunction(object):
    def __init__(self, path: str, suffix: str):
        self.path = path[len("www")::]
        if self.path.endswith("index"): self.path = self.path[0:len(self.path)-len("index")]
        if self.path == "": self.path = "/"
        self.content = ""

        self.contentType = "text/html"
        if suffix == ".json": self.contentType = "application/json"

    def html(self, html: str):
        self.content += f"echo({json.dumps(html)});\n"

    def script(self, script: str):
        regex_pattern = r"echo\(\s*(<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>([\s\S]*?)<(?:\"[^\"]*\"['\"]*|'[^']*'['\"]*|[^'\">])+>)\s*\)"

        found = re.search(regex_pattern, script)
        while found != None:
            tags = found.group(1).replace("\\", "\\\\").replace("`", "\`")
            span = found.span(1)
            script = f"{script[:span[0]]}`{tags}`{script[span[1]:]}"
            found = re.search(regex_pattern, script)

        self.content += f"{script}\n"


class Compiler(object):
    def __init__(self):
        self.functions = []

    def compile(self, www: list[pathlib.PosixPath]) -> None:
        for path in www:
            if not path.is_file():
                continue
            with path.open("r") as file:
                f = PocketbaseFunction(str(path).strip()[0:len(str(path))-len(path.suffix)], path.suffix)
                content = file.read()

                found = re.search(
                    r"<script[\s\S]pocketbase>[\s\S]*?<\/script>", content
                )
                while found != None:
                    # Parsing the html
                    f.html(content[0 : found.start()])
                    script = content[found.start() : found.end()]
                    script = script[
                        len("<script pocketbase>") : len(script) - len("</script>")
                    ]
                    f.script(script)

                    content = content[found.end() : :]

                    found = re.search(
                        r"<script[\s\S]*?pocketbase>[\s\S]*?<\/script>", content
                    )
                f.html(content)
                self.functions.append(f)
        
        functions = map(lambda x: f"fastify.all('{x.path}', responseBuilder('{x.contentType}', async function (pb, echo, request, reply) {{ {x.content} }}));", self.functions)
        code = "\n".join(functions)
        return code


if __name__ == "__main__":
    main()
