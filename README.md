<div style="text-align: center;">
  <img src="documents/logoIntelliInfer.jpg" alt="Logo IntelliInfer" style="max-width: 256 px; height: auto;">
</div>

# IntelliInfer

The IntelliInfer project, developed for the Advanced Programming exam at the Polytechnic University of the Marche (UNIVPM) during the academic year 2023-2024, represents an advanced API for managing datasets and executing inferences based on artificial intelligence models. This project was conceived to facilitate interaction with data and leverage the power of artificial intelligence to extract meaningful information from it. It was developed during the Master's degree program in Computer Engineering and Automation.


# Project Goal

The main goal of IntelliInfer is to provide an API for loading datasets, managing them, and using AI models to perform inference. Users can upload their datasets and utilize the available models to make predictions on new data.

# Design

## Rotte

| Auth | Function                                          | Role  |
|-----|---------------------------------------------------|--------|
| Yes | recharge user credit                              | admin  |
| Yes | update neural network model weights               | admin  |
| Yes | list neural networks’ models                      | user   |
| Yes | show a specific neural network’s model            | user   |
| Yes | create a new dataset                              | user   |
| Yes | delete a dataset                                  | user   |
| Yes | list all datasets                                 | user   |
| Yes | show a specific dataset                           | user   |
| Yes | update a dataset                                  | user   |
| Yes | upload a file on a dataset                        | user   |
| Yes | perform inference operation                       | user   |
| Yes | check the state of the current inference operation| user   |
| Yes | show inference results                            | user   |
| Yes | check user’s remaining credit                     | user   |
| Yes | save inference results                            | system |
| No  | generate auth token                               | all    |
| No  | check if the service is online                    | all    |


| Type  | Route                                            |
|-------|--------------------------------------------------|
| PUT   | /credit/recharge/:userId                         |
| PUT   | /model/:aiId/change/weights                      |
| GET   | /model/list                                      |
| GET   | /model/:modelId                                  |
| GET   | /dataset/list                                    |
| GET   | /dataset/:datasetId                              |
| POST  | /dataset/create                                  |
| PUT   | /dataset/:datasetId/update                       |
| DELETE| /dataset/:datasetId/delete                       |
| POST  | /dataset/:datasetId/upload  (zip & img)          |
| POST  | /inference/:datasetId/:aiId/                     |
| GET   | /inference/state/:resultId                       |
| GET   | /inference/result/:resultId                      |
| POST  | /inference/result/:resultId  (callback)          |
| GET   | /generate/token/:userId                          |
| GET   | /check/health                                    |


## Uses Case Diagram
<div style="text-align: center;">
  <img src="documents/UsesCaseDiagram.png" alt="Uses Case Diagram" style="max-width: 256 px; height: auto;">
</div>

# Database
Let's now look at the structure of our database and the patterns we used to manage it.

This project uses PostgreSQL as relational database. It was chosen for its advanced capabilities, its reliability and its compliance with SQL standards, making it ideal for applications requiring robust and secure data management.
Through it we manage and save data relating to users, datasets and related images and labels, to the AI architectures themselves and their results. Below you can find the structure of the database, in terms of associations and table field.

## ER Schema
<div style="text-align: center;">
  <img src="documents/ERscheme.png" alt="ER schema" style="max-width: 256 px; height: auto;">
</div>

## Database Schema
<div style="text-align: center;">
  <img src="documents/DatabaseSchema.png" alt="Database Schema" style="max-width: 256 px; height: auto;">
</div>

## Patterns
### Singleton Pattern
The Singleton pattern is used to ensure that only one instance of the database connection is created. This helps to efficiently manage connection resources and prevent problems related to managing multiple simultaneous connections. It ensures that all application components use the same database instance, improving consistency and performance.

To do this it uses a private constructor, accessible only via the getInstance() method. When accessed for the first time, the method creates an instance and returns the entity of the object to the client, while in subsequent calls the entity of the already existing object is returned.

<div style="text-align: center;">
  <img src="documents/SingletonClass.png" alt="Singleton class" width="100" height="auto">
</div>

### DAO Pattern
Sequelize is an ORM (Object-Relational Mapping) for Node.js used as DAO (Data Access Object) to facilitate the management of CRUD operations and the tables definition. We define models for each table in the database and use Sequelize as an high level interface to interact with PostgreSQL.

In Sequelize, database tables are represented by models. Each model is a class that maps to a specific table in the database, and contains table attributes, data types, validations, and relationships with other tables.

<div style="text-align: center;">
  <img src="documents/SequelizeModel.png" alt="Sequelize model" style="max-width: 128 px; height: auto;">
</div>

Sequelize also allows to define relationships between models, such as one-to-many, many-to-many, and one-to-one associations, defined using methods such as hasMany, belongsTo, hasOne, and belongsToMany.

<div style="text-align: center;">
  <img src="documents/relations.png" alt="Relationships between models" style="max-width: 128 px; height: auto;">
</div>

We use it as DAO pattern as it provides methods for performing CRUD operations on models. These methods include findAll, findByPk, create, update, and destroy.

### Repository Pattern
To improve the modularity and testability of the code, the Repository pattern is used in combination with Sequelize. With the Repository you are able to create objects that act as an interface between business logic and data access, and use Sequelize models to perform CRUD operations on the database. It is placed at a higher level than the DAO and on the contrary allows several different DAOs to interact. In fact, in our project it is used not only simple CRUD operations but also for more complex operations that required the use of multiple Sequelize models.

<div style="text-align: center;">
  <img src="documents/Repository.png" alt="Repository" style="max-width: 128 px; height: auto;">
</div>

# Proposed Neural Network Models

## Overview
In our application, users are able to perform inference on a variety of image datasets using different artificial intelligence models and various weight combinations. Specifically, they can execute inference on a YOLOv5 architecture and on a Faster RCNN. Furthermore, considering the possibility of having multiple models, we have introduced also a simulator of inference.

## YOLOv5
YOLOv5 is an object detection model that builds upon the success of its predecessors. Developed by Ultralytics, YOLOv5 offers significant advancements in speed and accuracy compared to previous versions. It employs a single neural network to detect objects within images or video frames in real-time, providing bounding box coordinates and class probabilities for each detected object. YOLOv5 is highly versatile, capable of detecting a wide range of objects across various environments with remarkable efficiency.

<div style="text-align: center;">
  <img src="documents/Yolo-v5.jpg" alt="Yolov5" style="max-width: 256 px; height: auto;">
</div>

What we did to implement inference on YOLOv5 in our project was to train a pre-existing architecture on a high-resolution SAR satellite image dataset. Subsequently, we saved the weights with which the user has the option to test this functionality, retrieving them from the database, and we implemented the script to perform inference on an architecture we imported. You can find it at the following link: https://github.com/jasonmanesis/Ship-Detection-on-Remote-Sensing-Synthetic-Aperture-Radar-Data.

<div style="text-align: center;">
  <img src="documents/boundingbox3.jpg" alt="Example result" style="max-width: 256 px; height: auto;">
</div>

## Faster RCNN
Also the Faster RCNN (Region-based Convolutional Neural Network) is a deep learning model widely used for object detection tasks. It represents a significant advancement over previous R-CNN architectures by integrating region proposal networks (RPNs) directly into the network architecture, enabling end-to-end training. Faster R-CNN achieves impressive accuracy and efficiency by leveraging convolutional neural networks (CNNs) to extract features from an input image and using the RPN to propose candidate object bounding boxes. These proposals are then refined and classified by subsequent layers in the network, resulting in precise object detection with reduced computational overhead. Faster R-CNN has become a popular choice for various applications, including autonomous driving, surveillance, and image understanding tasks.

<div style="text-align: center;">
  <img src="documents/FasterRCNN.png" alt="Faster RCNN" style="max-width: 256 px; height: auto;">
</div>

To implement inference on this architecture in our project, we relied on the resources found in the following GitHub repository: https://github.com/litcoderr/faster-rcnn-inference/blob/main/docker/Dockerfile


