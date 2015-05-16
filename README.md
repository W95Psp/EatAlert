<!--- title: EatAlert -->
# EatAlert
SMS (or whatever you want) alert to notify people that dinner is beginning
## Why ?
<!--- en -->
At home, my parents used to shout "We're eating" each time we was eating in family.
The fact is that sometimes, the communication isn't really perfect, and it's really boring.

(My ears were bored, in fact)

So I had this idea : instead of shouting loudly, why can't we just send a SMS ?
<!--- /en -->

## How
I did a small NodeJS application to warn people and ask them whether they understood we're eating. People receive an SMS, giving a link to say "Ok, I understood, wait two minutes, I'll be there".

## Sending SMS is free or ... ?
In fact, I live in France, and the cellular company I use, http://mobile.free.fr/, set up a free service for SMS notifications. http://www.universfreebox.com/article/26340/Tutoriel-Utiliser-la-notification-SMS-Free-Mobile-avec-un-NAS-Synology

## Configuration
Edit '''configuration.json''' :)

### Edit users profile photo
Each user have a profile photo, you'll find theses pics in ./static/profiles/{{username}}.jpg

### Example of conf file
```
{
    "message": {
        "content": "We're eating ! To confirm, please visit the link below :\n",
        "urlBase": "http://address-where-you-host-that.ext/"
    },
    "times": [60, 120, 180, 210, 234, 253, 270, 288],
    "users": [
        {"name": "Lola",    "login": 12345678,  "pwd": "AaBbCcddee3fgg"},
        {"name": "Bob",     "login": 12345678,  "pwd": "AaBbCc4deeffgg"},
        {"name": "Jade",    "login": 12345678,  "pwd": "AaBbCcd44effgg"},
        {"name": "Louis",   "login": 12345678,  "pwd": "AaB23456eeffgg"}
    ],
    port: "8080",
    "language": "en"
}
```
The "times" array mean : send a SMS after 60 seconds, another after 120 seconds, etc.

Password and login are for the SMS notification service I use.


### Add another way for notification (other SMS notification provider, or maybe email, homing pigeon... Anything you want)
Edit sendMessageTo function (that's on the top of ```main.js```)
(And send me the modification !)

