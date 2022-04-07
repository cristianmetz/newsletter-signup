    //require dotenv for secure key handling
    require("dotenv").config();
    console.log(process.env);
    //require installed node packages
    const express = require("express");
    const https = require("https");
    //Mailchimp API
    const mailchimp = require("@mailchimp/mailchimp_marketing");
    //create new express app
    const app = express();

    //enable express to access static files in folder called "Public"
    app.use(express.static("public"));

    //enable express to parse URL-encoded body i.e. info from HTML form
    app.use(express.urlencoded({
        extended: true
    }));

    //GET request
    app.get("/", function (req, res) {
        res.sendFile(__dirname + "/signup.html");
    });

    //Mailchimp Authentication
    mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_NEWSLETTER_SIGNUP_TOKEN,
        server: process.env.MAILCHIMP_SERVER,
    });
    //Mailchimp response: Health Status
    async function run() {
        const response = await mailchimp.ping.get();
        console.log(response);
    }

    run();

    //POST request
    app.post("/", function (req, res) {
        const firstName = req.body.fName;
        const lastName = req.body.lName;
        const email = req.body.eAddress;
        const listId = process.env.MAILCHIMP_LIST_ID;

        const subscribingUser = {
            firstName: firstName,
            lastName: lastName,
            email: email
        }
        const run = async () => {
            try { //If the connection successful add member to list
                const response = await mailchimp.lists.addListMember(listId, {
                    email_address: subscribingUser.email,
                    status: "subscribed",
                    merge_fields: {
                        FNAME: subscribingUser.firstName,
                        LNAME: subscribingUser.lastName
                    }
                });
                console.log(response); // (optional) 
                //If the connection is successful send user to success website
                res.sendFile(__dirname + "/success.html"); 
            } catch (err) {
                console.log(err.status);
                //If the connection has an error send user to failure website
                res.sendFile(__dirname + "/failure.html");
            }
        };
        run();
    });

    //when the try again button/form is clicked it redirected the user to the signup page.
    app.post("/failure", function(req,res){
        res.redirect("/");
    })

    //Use express app to listen to a dinamic port for Heroku or Local3000 Port
    app.listen(process.env.PORT || 3000, function () {
        console.log("Server is running.")
    });