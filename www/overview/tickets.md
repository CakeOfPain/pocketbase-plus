# 🎯 Project Board

- [Create a Ticket](#create-a-ticket)
- [Tickets](#tickets)
- [Dependencies](#dependencies)


## Create a Ticket
Here you can create a new Ticket
<script pocketbase>
    echo.form(
        "/actions/create-ticket",
        [
            // ["name", "type", "placeholder", "param"],
            ["Name", "text", "Name des Tickets", "ticketName"],
            ["Description", "textarea", "Your description of the ticket", "ticketDescription"],
        ]
    );
</script>

## Tickets

Here is the overview of existing tickets.

<script pocketbase>
    const tickets = await pb.collection("ticket").getList(1, 50, {
        fields: 'id,name,description,depends_on',
        filter: 'status != "done"'
    });

    tickets.items.forEach(ticket => {
        ticket['link'] = `[${ticket.name}](/overview/ticket/details?id=${ticket.id})`;
    });

    echo.table(tickets.items, ['link', 'description'], ['name', 'description']);

    // echo.table(); Ok
    // echo.code();
    // echo.interactive();
    // echo.parameter();
    // echo.value();
    // echo.button();
    // echo.form();
</script>


## Dependencies

<script pocketbase>
    echo.mermaid(`
    graph TD
    ${
        tickets.items.map(ticket => `${ticket.id}[${ticket.name}]`).join("\n")
    }
    ${
        tickets.items.map(ticket =>
        ticket.depends_on
            .filter(dependency => tickets.items.map(x=>x.id).includes(dependency))
            .map(dependency => dependency + "-->" + ticket.id)
            .join("\n")
        ).join("\n")
    }
    `);
</script>