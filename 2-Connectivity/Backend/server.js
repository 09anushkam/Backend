import express from "express";

const app=express();

// middleware - if we move `dist` of frontend to backend
// app.use(express.static("dist"))

app.get('/',(req,res)=>{
    res.send("Server is ready");
});

app.get('/api/jokes',(teq,res)=>{
    const jokes=[
        {
            id:1,
            title:'A joke',
            content:'this is a joke',
        },
        {
            id:2,
            title:'Another joke',
            content:'this is another joke',
        },
        {
            id:3,
            title:'Third joke',
            content:'this is a third joke',
        },
        {
            id:4,
            title:'Fourth joke',
            content:'this is a fourth joke',
        },
    ];
    res.send(jokes);
});

const port=process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`Server started at http://localhost:${port}`);
});

