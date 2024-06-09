<div style="text-align: center;">
  <img src="documents/logoIntelliInfer.jpg" alt="Logo IntelliInfer" style="max-width: 256 px; height: auto;">
</div>

# IntelliInfer

## Table of Contents
- [Introduction](#introduction)
- [Project Goal](#projectgoal)
- [Design](#design)
  - [Rotte](#rotte)
  - [Uses Case Diagram](#usescasediagram)
  - [Sequence Diagrams](#sequencediagrams)
- [Database](#database)
  - [ER Schema](#erschema)
  - [Database Schema](#databaseschema)
  - [Sequelize](#sequelize)
- [Patterns](#patterns)
  - [Singleton Pattern](#singletonpattern)
  - [DAO Pattern](#daopattern)
  - [Repository Pattern](#repositorypattern)
  - [Factory Pattern](#factorypattern)
- [Proposed Neural Network models](#proposedneuralnetworkmodels)
  - [Overview](#overview)
  - [Yolov5](#yolov5)
  - [Faster RCNN](#fasterrcnn)
- [Authors](#authors)
- [License](#license)

# Introdution
The IntelliInfer project, developed for the Advanced Programming exam at the Polytechnic University of the Marche (UNIVPM) during the academic year 2023-2024, represents an advanced API for managing datasets and executing inferences based on artificial intelligence models. This project was conceived to facilitate interaction with data and leverage the power of artificial intelligence to extract meaningful information from it. It was developed during the Master's degree program in Computer Engineering and Automation.


# Project Goal

The main goal of IntelliInfer is to provide an API for loading datasets, managing them, and using AI models to perform inference. Users can upload their datasets and utilize the available models to make predictions on new data.

# Quick start

- env
- modificare la chiave privata all'interno di ```secrets```
- ```bash
   openssl genrsa -des3 -out test_purpose_private_key.pem 2048
- ```bash
   openssl rsa -in test_purpose_private_key.pem -pubout -out test_purpose_public_key.pem


# Design

## Class Diagram

<div style="text-align: center;">
  <img src="documents/ClassesDiagram.drawio.png" alt="Sequelize model" width="950" height="auto">
</div>

## Uses Case Diagram
<div style="text-align: center;">
  <img src="documents/UsesCaseDiagram.drawio.png" alt="Uses Case Diagram" style="max-width: 256 px; height: auto;">
</div>


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


## Sequence Diagrams

<div style="text-align: center;">
  <img src="documents/DELETE_api_dataset_delete_datasetId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_dataset_datasetId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_dataset_list.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_display_credit.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_generate_token.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_model_list.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/GET_api_model_modelId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/POST_api_datastet_create.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/POST_api_upload_file.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/PUT_admin_credit_recharge.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/PUT_admin_model_aiId_change_weights.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

<div style="text-align: center;">
  <img src="documents/POST_api_dataset_update_datasetId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>


# Database
Let's now look at the structure of our database and the patterns we used to manage it.

This project uses PostgreSQL as relational database. It was chosen for its advanced capabilities, its reliability and its compliance with SQL standards, making it ideal for applications requiring robust and secure data management.
Through it we manage and save data relating to users, datasets and related images and labels, to the AI architectures themselves and their results. Below you can find the structure of the database, in terms of associations and table field.

## ER Schema
<div style="text-align: center;">
  <img src="documents/ER.drawio.png" alt="ER schema" width="900" height="auto">
</div>

## Database Schema
<div style="text-align: center;">
  <img src="documents/schemadatabase.drawio.png" alt="Database Schema" width="850" height="auto">
</div>

## Sequelize
Sequelize is an ORM (Object-Relational Mapping) for Node.js used to facilitate the management of CRUD operations and the tables definition. We define models for each table in the database and use Sequelize as an high level interface to interact with PostgreSQL.

In Sequelize, database tables are represented by models. Each model is a class that maps to a specific table in the database, and contains table attributes, data types, validations, and relationships with other tables.

<div style="text-align: center;">
  <img src="documents/SequelizeModel.png" alt="Sequelize model" width="400" height="auto">
</div>

Sequelize also allows to define relationships between models, such as one-to-many, many-to-many, and one-to-one associations, defined using methods such as hasMany, belongsTo, hasOne, and belongsToMany.

<div style="text-align: center;">
  <img src="documents/relations.png" alt="Relationships between models" width="400" height="auto">
</div>

# Patterns 
## Singleton Pattern
The Singleton pattern is used to ensure that only one instance of the database connection is created. This helps to efficiently manage connection resources and prevent problems related to managing multiple simultaneous connections. It ensures that all application components use the same database instance, improving consistency and performance.

To do this it uses a private constructor, accessible only via the getInstance() method. When accessed for the first time, the method creates an instance and returns the entity of the object to the client, while in subsequent calls the entity of the already existing object is returned.

<div style="text-align: center;">
  <img src="documents/SingletonClass.png" alt="Singleton class" width="400" height="auto">
</div>

## DAO Pattern
We implemented the Data Access Object (DAO) pattern to manage database operations using Sequelize models. The DAO pattern is a structural pattern that abstracts and encapsulates all access to the data source and provide a consistent API for CRUD (Create, Read, Update, Delete) operations. It is an intermediary between the application's business logic and the database, it isolates the application layer from the persistence layer, making the codebase more modular and easier to maintain, and it promotes code reuse by centralizing data access logic. This results in a more robust, flexible, and scalable application architecture.

In detail, we defined a Dao Interface IDao to define all optional crud operations available for our models, and we defined for each Sequelize model a Dao class implementing the operations according to our needs.

NB: inserire qui il codice tipo di un DAO e l'interfaccia IDao

## Repository Pattern
To improve the modularity and testability of the code, the Repository pattern is used in combination with DAO pattern. The Repository pattern is placed at an higher level than the Data Access Object and on the contrary allows several different DAOs to interact. We defined a IRepository interface and we implemented the Repository class to define more complex operations that required the use of multiple DAO models. 

<div style="text-align: center;">
  <img src="documents/Repository.png" alt="Repository" width="400" height="auto">
</div>

## Factory Pattern
The Factory pattern is used to define and manage exceptions. It is a creational pattern that provides an interface for creating objects, allowing subclasses to alter the type of objects that will be created. By using this pattern for exceptions, we centralize the creation logic, making it easier to manage and extend our error handling mechanism. It allows us to create different types of specific exception object in a consistent and centralized manner. 

<div style="text-align: center;">
  <img src="documents/FactoryPattern.drawio.png" alt="Sequelize model" width="400" height="auto">
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

## Authors
This project is developed and maintained by the following authors:

- **Zazzarini Micol** - [GitHub Profile](https://github.com/MicolZazzarini)
- **Fiorani Andrea** - [GitHub Profile](https://github.com/125ade)

## License
This project is licensed under the [MIT License](LICENSE) - consulta il file [LICENSE](LICENSE) per ulteriori dettagli.


