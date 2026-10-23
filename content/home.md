<!-- Edit the words and image using Markdown. Keep each :id=... so menu links continue to work. -->

# A database built around **your world.** :id=top

> objy.db

An object-driven database for the things your application is built around. Give people, places, products, and processes their own data, behavior, and context.

[Discover the object-driven idea](/?id=objy-db)

![A small house, a tree, a person, a parcel, and a handheld device, brought together into one miniature world.](assets/site/objects-world.png)

## What makes a database object-driven? :id=objy-db

An object represents one meaningful thing in your application. It brings together **what that thing is, what it does, and where it belongs**.

Think of a package. It has a destination and a delivery status. It can share a structure with other packages, respond when its status changes, and belong to a particular workspace. In objy.db, those ideas live together in the object.

## Give every thing its own shape. :id=objects

Start with the data that describes it. A package has a weight and a destination; a person has a name and contact details. Use simple values, typed properties, or nested information to give each object the shape it needs.

Your application decides what an object represents.

## Define once. Build on it. :id=inheritance

Objects can inherit properties and behavior from other objects. Define a common package once, then use it as the starting point for a parcel, a return, or a special delivery.

Share what is common. Add what makes each object different.

## Let your data do something. :id=behavior

An object can respond when it is created, changed, or deleted. It can also act at a particular time or on a repeating schedule.

A package could run a confirmation action when its status changes to delivered. The behavior stays with the thing it describes.

## Put everything in its context. :id=context

The same kinds of objects can serve different organizations and applications. Keep their data separate and define who can create, read, change, or delete an object.

A shared object model, with a place and permissions for each object.

## Choose where objects live. :id=storage

Your object model stays familiar as your storage changes. Start with objects in memory, use a MongoDB mapper, or connect your own storage adapter.

## Start with objects. Build anything. :id=build-anything

Packages, people, and delivery processes can become a logistics application. Rooms, devices, and actions can become a smart building. The details change; the object-driven idea stays the same.

**objy.db is the first product from OBJY: build anything using abstract objects.**

[Explore the documentation](docs/)
