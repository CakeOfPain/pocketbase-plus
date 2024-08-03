
# Linking a ticket

This could take some time.

<script pocketbase>
    const ticket_id = request.body.id;
    
    // example create data
    const data = {
        "name": ticketName,
        "description": ticketDescription,
        "depends_on": [],
        "status": "backlog"
    };

    const record = await pb.collection('ticket').create(data);

    reply.redirect('/overview/tickets')
</script>