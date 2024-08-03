<script pocketbase>
    const id = request.query.id;
    const ticket = await pb.collection('ticket').getOne(id, {});
    echo(`# ${ticket.name}`);
    echo.table([
        {property: '⌛️ created', value: ticket.created},
        {property: '⏳ updated', value: ticket.updated},
    ], ["property", "value"]);
</script>

---

<script pocketbase>
    echo(ticket.description);
    echo.banner("info", "ℹ️ This ticket is very cool");
</script>

- [Link Ticket](#dependency)
- [Close Ticket](#close-the-ticket)

## Actions

### Dependency
<script pocketbase>
    const tickets = await pb.collection("ticket").getList(1, 50, {
        fields: 'id,name',
        filter: `id != "${id}"`
    });


    echo.form("/actions/link-ticket", [
        ["Depends on", "select", "", "depends_on", tickets.items.map(
            ticket => [ticket.id, ticket.name]
        )]
    ], {
        submitMessage: "link ticket"
    })
</script>

[Info Page](/overview/ticket/info)

### Close the Ticket


<script pocketbase>
    echo.form("/actions/close-ticket", [
        ["Resolve Message", "textarea", "Enter your resolve message...", "resolve_message"]
    ], {
        submitMessage: "close ticket"
    });
</script>