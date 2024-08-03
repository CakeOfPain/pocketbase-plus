
# Creating a ticket

This could take some time.

<script pocketbase>
    const ticketName = request.body.ticketName;
    const ticketDescription = request.body.ticketDescription;
    
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