
if(!pb.authStore.isValid) {
    echo(JSON.stringify({
        "message": "Invalid Authorization JWT"
    }));
    reply.code(401);
    return;
}

echo(JSON.stringify({
    "username": "user.name"
}));