const express=require("express");
const cors=require("cors");

const app=express();

app.use(cors());
app.use(express.json());

let orders=[];
let id=1;

app.get("/",(req,res)=>{
res.json({message:"Achir backend working"});
});

app.get("/api/orders",(req,res)=>{
res.json(orders);
});

app.post("/api/orders",(req,res)=>{

const order={
id:id++,
name:req.body.name,
phone:req.body.phone,
city:req.body.city,
created_at:new Date().toLocaleString()
};

orders.push(order);

res.json(order);

});

app.delete("/api/orders/:id",(req,res)=>{

orders=orders.filter(o=>o.id!=req.params.id);

res.json({success:true});

});

app.listen(3000,()=>{
console.log("Server running");
});
