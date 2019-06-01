const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

app.use((req, res, next) => { //need it for development cors requests
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.use('/public', express.static(process.cwd() + '/public'));
app.get('/', (req, res) => res.sendFile(process.cwd() + '/public/index.html'));

//database stuff
(async () => {
try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Database connection successful') ;
}
catch (err) {
    console.log(err);
}
})()

const Schema = mongoose.Schema;

const ThreadSchema = new Schema({
board: String,
text: String,
delete_password: String,
created_on: Date,
bumped_on: Date,
reported: Boolean,
replies: [{
    text: String,
    created_on: Date,
    delete_password: String,
    reported: Boolean
}],
replycount: Number //need it for simplicity because i sometimes modify the local copy's array of replies 
});

const Thread = mongoose.model('Thread', ThreadSchema);

app.route('/api/threads/:board')
.get(async (req, res) => {
    try {
        let threads = await Thread.find({board: req.params.board});
        threads = threads.sort((a, b) => b.bumped_on - a.bumped_on).slice(0,10);
        threads.forEach(thread => {
            thread.replies = thread.replies.slice(-3);
            thread.delete_password = undefined; //delete keyword doesn't work for some reason
            thread.reported = undefined;
        })
        res.json(threads);
    }
    catch (err) {
        console.log(err);
    }
})
.post(async (req, res) => {
    let thread = {};
    thread.board = req.params.board;
    thread.text = req.body.text;
    thread.delete_password = req.body.delete_password;
    thread.created_on = new Date();
    thread.bumped_on = thread.created_on;
    thread.reported = false;
    thread.replies = [];
    thread.replycount = 0;
    try {
        if (thread.text == undefined || thread.text == "") {
            res.send("thread text cannot be empty");
            return;
        }        
        else if (thread.delete_password == undefined || thread.delete_password == "") {
            res.send("delete password wasn't set");
            return;
        }
        await Thread.create(thread);
        //res.redirect('/b/' + req.params.board + '/'); to change
    }
    catch (err) {
        console.log(err);
    }
})
.put(async (req, res) => {
    try {
        let thread = await Thread.findOne({_id: req.body.thread_id}); //it's silly to use the db _id as a post _id but it's what fcc requires, w/e
        if (thread === null) { //still need casterror with findone, but leave this check just in case, behavior seems inconsistent
            res.send("unknown thread id");
            return;    
        }
        thread.reported = true;
        await thread.save();
        res.send("success");
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }
})
.delete(async (req, res) => {
    try {
        const thread = await Thread.findOne({_id: req.body.thread_id});
        if (thread === null) {
            res.send("unknown thread id");
            return;    
        }
        const password = thread.delete_password;
        if (password == req.body.delete_password) { //doesn't work with === huh
            await thread.remove(); //not! Thread.remove(), no wonder it got deprecated, lol, too easy to make a terrible mistake
            res.send("success");
        }
        else {
            res.send("incorrect password");
        }
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }    
});

app.route('/api/replies/:board')
.get(async (req, res) => {
    try {
        const thread = await Thread.findOne({_id: req.query.thread_id});
        if (thread === null) {
            res.send("unknown thread id");
            return;    
        }
        thread.delete_password = undefined;
        thread.reported = undefined;
        thread.replies.forEach(reply => {
            reply.delete_password = undefined;
            reply.reported = undefined;
        });
        res.json(thread);
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }
})
.post(async (req, res) => {
    let reply = {};  
    reply.text = req.body.text;
    reply.delete_password = req.body.delete_password;
    reply.created_on = new Date();
    reply.reported = false;
    try {
        if (reply.text == undefined || reply.text == "") {
            res.send("reply text cannot be empty");
            return;          
        }        
        else if (reply.delete_password == undefined || reply.delete_password == "") {
            res.send("delete password wasn't set");
            return;
        }
        let thread = await Thread.findOne({_id: req.body.thread_id});
        if (thread === null) {
            res.send("unknown thread id");
            return;    
        }        
        thread.bumped_on = new Date();
        thread.replies.push(reply);
        thread.replycount += 1;
        await thread.save();
        //res.redirect('/b/' + req.params.board + '/' + req.body.thread_id); to change
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }
})
.put(async (req, res) => {
    try {
        let thread = await Thread.findOne({_id: req.body.thread_id});
        if (thread === null) {
            res.send("unknown thread id");
            return;    
        }
        let response;
        for (let i = 0; i < thread.replies.length; i++) {
            let reply = thread.replies[i];
            if(reply._id == req.body.reply_id) { //type object is compared to type string, so ==
            reply.reported = true;
            response = "success";
            break;
            }          
        }
        if (response !== "success") {
            response = "unknown reply id";
        }
        else {
            await thread.save();
        }
        res.send(response);
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }  
})
.delete(async (req, res) => {
    try {
        let thread = await Thread.findOne({_id: req.body.thread_id});
        if (thread === null) {
            res.send("unknown thread id");
            return;    
        }
        let response, reply, index;
        for (let i = 0; i < thread.replies.length; i++) {
            reply = thread.replies[i];
            index = i;
            if(reply._id == req.body.reply_id) { //type object is compared to type string, so ==
                reply.reported = true;
                response = "success";
                break;
            }          
        }
        if (response !== "success") {
            response = "unknown reply id";
        }
        else if (req.body.delete_password == reply.delete_password) { //see above
            thread.replies.splice(index, 1);
            thread.replycount -= 1;
            await thread.save();
        }
        else {
            response = "incorrect password";
        }
        res.send(response);
    }
    catch (err) {
        if (err.name === "CastError" && err.path === "_id" && err.reason === undefined) {res.send("unknown thread id");}
        else {console.log(err.message);}
    }      
});

app.listen(process.env.PORT || 3001);
