Wish
====

a Node.js web service framework

What is it?
-----------
There are three tiers of framework available in Wish.
1. a functional, asynchronous convenience package which simplifies callback stacks, trivializes service filters, and makes SQL fun
2. a declarative DSL for rapid definition and implementation of RESTful services, database entities, and all sorts of HATEOAS goodness
3. an exapandable module system which allows reuse of boilerplate such as user entities, authentication, authorization, and audit logging

Each tier builds upon the next. Ignore the bits you hate. Use the bits you like. Expand upon the bits you love.

Wish is strictly RESTful. Wish is pure Javascript. Wish doesn't concern itself with display logic.

How do I Wish?
--------------
There will be tutorial videos and example projects. For now, just read the unit tests. Sorry!

How does the Wish project work?
-------------------------------
* Wish lives on GutHub.
* Wish doesn't have a build process yet, but soon.
* Wish doesn't have continuous integration yet, but soon.
* Wish isn't published yet, but soon.
* Wish uses jslint to validate all Javascript. Yes, the perverse one.

Who created Wish?
-----------------
Wish is the result of Kyle W. Cartmell getting really mad about rework and falling very much in love with Node.js and the good parts book by Mr. Crockford.

How can I help?
---------------
Look at the Wish backlog and/or talk to Kyle. Or don't. Write a thing or fix a thing. Make sure Wish still builds. Make sure the test suite still passes. Make sure jslint isn't angry with you. Write tests for your stuff. Send a pull request to Kyle. BOOM!

Gosh that sounds like a lot of work. If it's any consolation Kyle will probably thank you profusely for your help and list you as a co-author in the documentation. Not exactly a great honor, but still. Heck, if you're an Arizona resident Kyle will even buy you a beer at four peaks.

Strong Foundational Opinions
----------------------------
The following opinions belong to the author of this framework. They underlie the design of the wish framework.
You are free to agree or disagree, but if you disagree you will likely find deep sadness in the use of wish.
No effort will be wasted upon the defense of these opinions.
Cries for change, screams of anger, or pleas for mercy shall are doomed to fall on deaf ears. You have been warned.
1. Strict adherence to REST is extremely valuable.
2. SQL code should live alongside business logic rather than being segregated or abstracted away.
3. Human meatbrains should be allowed to express logic in an imperative form.
4. Test-Driven Development is the key to a well-engineered software solution.
5. High-level documentation and self-documenting code is critical. Code comments, not so much.
6. Common tasks must be trivial. Uncommon tasks must be easy. Rare tasks must be possible.