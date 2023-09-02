//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-Alisa:Mytest135@cluster0.zm4ogjd.mongodb.net/todolistDB")
.then(()=>console.log('connected'))
.catch(e=>console.log(e));

const itemsSchema = mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"TodoList"
});
const item2 = new Item({
  name:"Hello to do list"
});
const item3 = new Item({
  name:"Delete an item."
});
const item4 = new Item({
  name:"Another item."
});

const defaultItems =[item1,item2,item3];
const listSchema = mongoose.Schema ({
  name:String,
  items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({})
  .then(function(all) {
    if(all.length === 0){
    Item.insertMany(defaultItems)
    .then(function () {
      console.log("Successfully saved all item to DB.");
    })
    } else {
      res.render("list", {listTitle: "Today", newListItems: all});
    };
  })
});

app.get("/:customName", function (req,res){
  const customListName = _.capitalize(req.params.customName);
  List.findOne({name:customListName})
  .then(function(foundList){
      if(foundList == null) {
        const list = new List ({
          name:customListName,
          items:defaultItems
        });
        list.save()
        res.redirect("/" + customListName)
      } else {
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
     })
    .catch((err)=> {
      console.log(err);
    })
  })


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItemName = new Item ({
    name:itemName})
  if(listName === "Today"){
    newItemName.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName})
    .then(function(foundList){
        foundList.items.push(newItemName);
        foundList.save();
        res.redirect("/" + listName);
    })
  }
});

app.post("/delete", function(req,res){
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemID)
    .then(function(){
      res.redirect("/")
    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID}}})
    .then(function(){
        res.redirect("/" + listName);
    })
  }
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
 });