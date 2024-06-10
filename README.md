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

# Infrastructure

IntelliInfer leverages several powerful technologies to ensure efficient and scalable deployment and job management, such as Docker, Docker Compose, BullMQ, and Redis.

<div style="text-align: center;">
  <img src="documents/InfrastructureScheme.jpeg" alt="Sequelize model" width="650" height="auto">
</div>
InfrastructureScheme.jpeg

## Docker

Docker is a containerization platform that allows us to package applications and their dependencies into portable containers that can run consistently across various environments, ensuring that our microservices behave the same way in development, testing, and production.

We use Docker to:
- **Encapsulate our inference microservices**: Each microservice runs in its own container, ensuring isolation and consistency.
- **Simplify deployment**: Containers can be easily deployed, stopped, and scaled without worrying about underlying hardware or OS specifics.
- **Enhance reproducibility**: Docker ensures that our development and production environments are identical, reducing various issues.

It is also important to note that the potential of the Docker API was exploited to dynamically generate the containers where the inference operation is carried out.

### Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. With Docker Compose, we can define all the services our application needs (such as microservices, databases, and message queues) in a single YAML file and manage them collectively.

We use Docker Compose to:
- **Orchestrate our microservices**: Define and run our inference microservices, Redis, and other components together.
- **Automate the setup**: Easily spin up the entire stack with a single command (`docker-compose up`), including network configuration and service dependencies.
- **Manage configurations**: Centralize and manage configuration settings for all services in a single file.

### Redis

Redis is an in-memory data structure store that we use primarily as a database and message broker. It is known for its high performance and versatility.

In our infrastructure, Redis is used to:
- **Store job information**: Act as a database to store the state and metadata of jobs queued for processing.
- **Facilitate messaging**: Serve as a message broker to manage the communication between different microservices via job queues.
- **Provide persistence**: Although primarily in-memory, Redis supports persistence, ensuring that job states are not lost between restarts.

### BullMQ

BullMQ is a Node.js library for creating robust and scalable job queues using Redis. It allows us to manage background jobs and processing with ease.

We use BullMQ to:
- **Manage job queues**: Queue and process inference jobs dynamically, ensuring efficient task distribution among available microservices.
- **Handle retries and failures**: Automatically retry failed jobs and log errors for later inspection.
- **Monitor job progress**: Provide real-time insights into job status, including completed, failed, and in-progress jobs.

### Integration and Workflow

Here's a more detailed look at how these components work together in our infrastructure:

1. **Microservices Deployment**:
   - **Docker** containers are used to deploy each microservice ( API, Postgre Database, Redis, YOLO neural network, inference simulation), ensuring they run in isolated and consistent environments.
   - **Docker Compose** orchestrates these microservices setting up the necessary networking and dependencies automatically.

2. **Job Management**:
   - Jobs (inference requests) are created and added to queues managed by **BullMQ**.
   - **Redis** acts as the job database, storing details about each job, including its status, progress, and results.

3. **Processing and Monitoring**:
   - Microservices pull jobs from the queues, process them, and update the job status in Redis.
   - BullMQ provides mechanisms to monitor job status and handle retries in case of failures, ensuring robustness and reliability.

By combining these technologies, our infrastructure can dynamically scale, efficiently manage resources, and ensure reliable job processing. This setup allows us to focus on developing high-quality inference models without worrying about the underlying deployment and job management complexities.


# Design

## Class Diagram
The class diagram shows a general overview of the structure of the project. The implementation relationships of the interfaces and the relationships between different classes are indicated. It is also possible to note which classes are involved in the use of the different patterns.

<div style="text-align: center;">
  <img src="documents/ClassesDiagram.drawio.png" alt="Sequelize model" width="950" height="auto">
</div>

## Uses Case Diagram
The use case diagram represents which routes are intended for use by the user and by the admin. It is possible to have an in-depth explanation of the latter later, together with the relevant sequence diagrams, which give a better representation of the flow of the project.

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
Route to logically delete a dataset:

<div style="text-align: center;">
  <img src="documents/DELETE_api_dataset_delete_datasetId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to find a specific dataset given its id:

<div style="text-align: center;">
  <img src="documents/GET_api_dataset_datasetId.drawio .png" alt="Sequelize model" width="850" height="auto">
</div>

Route to display all available datasets for a user:

<div style="text-align: center;">
  <img src="documents/GET_api_dataset_list.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to display the user's residual credit:

<div style="text-align: center;">
  <img src="documents/GET_api_display_credit.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to generate token for user or admin:

<div style="text-align: center;">
  <img src="documents/GET_api_generate_token.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to display list of all available AI models:

<div style="text-align: center;">
  <img src="documents/GET_api_model_list.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to find a specific AI model given its id:

<div style="text-align: center;">
  <img src="documents/GET_api_model_modelId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to create a dataset:

<div style="text-align: center;">
  <img src="documents/POST_api_datastet_create.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to upload a file (image or zip):

<div style="text-align: center;">
  <img src="documents/POST_api_upload_file.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to recharge user's credit:

<div style="text-align: center;">
  <img src="documents/PUT_admin_credit_recharge.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to update weights' path for an AI model:

<div style="text-align: center;">
  <img src="documents/PUT_admin_model_aiId_change_weights.drawio .png" alt="Sequelize model" width="850" height="auto">
</div>

Route to update dataset's name:

<div style="text-align: center;">
  <img src="documents/POST_api_dataset_update_datasetId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to init a new inference operation:

<div style="text-align: center;">
  <img src="documents/GET_inference_datasetId_aiId.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>

Route to check the state of an inference:

<div style="text-align: center;">
  <img src="documents/Get_inference_status.drawio.png" alt="Sequelize model" width="850" height="auto">
</div>


# Database
Let's now look at the structure of our database and the patterns we used to manage it.

This project uses PostgreSQL as relational database. It was chosen for its advanced capabilities, its reliability and its compliance with SQL standards, making it ideal for applications requiring robust and secure data management.
Through it we manage and save data relating to users, datasets and related images, to the AI architectures themselves and their results. Below you can find the structure of the database, in terms of associations and table field.

## ER Schema
<div style="text-align: center;">
  <img src="documents/ER.drawio.png" alt="ER schema" width="750" height="auto">
</div>

## Database Schema
<div style="text-align: center;">
  <img src="documents/schemadatabase.drawio.png" alt="Database Schema" width="850" height="auto">
</div>

## Sequelize
Sequelize is an ORM (Object-Relational Mapping) for Node.js used to facilitate the management of CRUD operations and the tables definition. We define models for each table in the database and use Sequelize as an high level interface to interact with PostgreSQL.

In Sequelize, database tables are represented by models. Each model is a class that maps to a specific table in the database, and contains table attributes, data types, validations, and relationships with other tables.

```typescript
Ai.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.CHAR(200),
      allowNull: false
    },
    description: {
      type: DataTypes.CHAR(300),
    },
    pathweights: {
      type: DataTypes.CHAR(300),
      allowNull: false
    },
    architecture: {
      type: DataTypes.ENUM,
      values: Object.values(AiArchitecture),
      allowNull: false,
      defaultValue: AiArchitecture.YOLO
    }
  },
  {
    sequelize,
    modelName: "Ai",
    tableName: "ai",
    timestamps: true,
    createdAt: 'created_at', // Utilizza la convenzione 'created_at' per il timestamp di creazione
    updatedAt: 'updated_at' 
  },
);
```

Sequelize also allows to define relationships between models, such as one-to-many, many-to-many, and one-to-one associations, defined using methods such as hasMany, belongsTo, hasOne, and belongsToMany. In particular, in many-to-many relationships an intermediate table was defined:

```typescript
DatasetTags.init(
  {
    // Chiavi esterne
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      field: 'dataset_id'
    },
    tagId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      field: 'tag_id'
    }
  },
  {
    sequelize,
    modelName: 'DatasetTags',
    tableName: 'datasetstags',
    timestamps: false,
  }
);
```


# Patterns

## Singleton Pattern
The Singleton pattern is used to ensure that only one instance of the database connection is created. This helps to efficiently manage connection resources and prevent problems related to managing multiple simultaneous connections. In IntelliInfer the Singleton pattern is used to guarantee a single connection to Redis and to the database and to guarantee having a single access to the job queue. It ensures that all application components use the same instance, improving consistency and performance.

To do this, it uses a private constructor, accessible only via the getInstance() method. When accessed for the first time, the method creates an instance and returns the entity of the object to the client, while in subsequent calls the entity of the already existing object is returned.

```typescript
export class SequelizeConnection {
  
  // Connection instance
  private static instance: SequelizeConnection;
  public sequelize!: Sequelize;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {}
  
  // Initialize connection
  private static InitializeConnection(): SequelizeConnection {
    
    const newInstance = new SequelizeConnection();

    const user: string = process.env.POSTGRES_USER || "myuser";
    const password: string = process.env.POSTGRES_PASSWORD || "mypassword";
    const database: string = process.env.POSTGRES_DB || "db_inference";
    const dialect: Dialect = process.env.SEQUELIZE_DIALECT as Dialect || 'postgres';
    const host: string = process.env.POSTGRES_HOST || 'database';
    const port: number = Number(process.env.POSTGRES_PORT || '5432')
    const flag_log: boolean = Boolean(process.env.SEQUELIZE_LOGGING ) || true;

    newInstance.sequelize = new Sequelize(
        database,
        user,
        password,
        {
          dialect: dialect,
          host: host,
          port: port,
          logging: flag_log ? logSequelize : false,
        });

    return newInstance;

  }

  /**
   * static method that controls the access to the singleton instance.
   */
  public static getInstance(): SequelizeConnection {
    if (this.instance === undefined) this.instance = this.InitializeConnection();

    return this.instance;
  }
}
```

## DAO Pattern
We implemented the Data Access Object (DAO) pattern to manage database operations using Sequelize models. The DAO pattern is a structural pattern that abstracts and encapsulates all access to the data source and provide a consistent API for CRUD (Create, Read, Update, Delete) operations. It is an intermediary between the application's business logic and the database, it isolates the application layer from the persistence layer, making the codebase more modular and easier to maintain, and it promotes code reuse by centralizing data access logic. This results in a more robust, flexible, and scalable application architecture.

In detail, we defined a Dao Interface IDao to define all optional crud operations available for our models, and we defined for each Sequelize model a Dao class implementing the operations according to our needs.

```typescript
export interface IDao<T> {
    create?(item: any): Promise<T | ConcreteErrorCreator>;
    findById?(id: number): Promise<T | ConcreteErrorCreator>;
    findAll?(): Promise<T[] | ConcreteErrorCreator>;
    logicallyDelete?(id: number): Promise<object>;
    updateItem?(id: number, property: any): Promise<T | ConcreteErrorCreator>;
    updateCount?(Id: number, num: number): Promise<T | ConcreteErrorCreator> ;
    findAllByDatasetId?(dataset: number): Promise<string[]>;
}

export default class AiDao implements IDao<Ai> {

    constructor() {}
    
    // creates an ai model given a series of metadata
    async create(aiJson: any): Promise<Ai> {
        try{
            const ai = await Ai.create(aiJson);
            return ai;
        } catch{
            throw new ConcreteErrorCreator().createServerError().setFailedCreationItem();
        }
    }
    
    // returns the list of all ai models on db
    async findAll(): Promise<Ai[] | ConcreteErrorCreator> {
          const models = await Ai.findAll();
          if( models.length !== 0){
            return models;
          } else {
            throw new ConcreteErrorCreator().createNotFoundError().setAbsentItems();
          }
    }
    
   // finds a specific ai model given its id
    async findById(id: number): Promise<Ai | ConcreteErrorCreator> {
            const model = await Ai.findByPk(id);
            if(!model){
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
            }
            return model;
    }
    
    // updates weights path of an ai specified by its id
    async updateItem(id: number, weights: any): Promise<Ai | ConcreteErrorCreator> {
        const model = await Ai.findByPk(id);
            if(!model){
                throw new ConcreteErrorCreator().createNotFoundError().setAbstentModel();
            }
            model.pathweights = weights;
            model.save();
            return model;
    }
    
}
```


## Repository Pattern
To improve the modularity and testability of the code, the Repository pattern is used in combination with DAO pattern. The Repository pattern is placed at an higher level than the Data Access Object and on the contrary allows several different DAOs to interact. We defined a IRepository interface and we implemented the Repository class to define more complex operations that required the use of multiple DAO models. 

```typescript
export interface IRepository {
    getUserById(userId: number): Promise<User | ConcreteErrorCreator>;
    getUserByEmail(userEmail: string): Promise<User | ConcreteErrorCreator>;
    getDatasetListByUserId(userId: number): Promise<Dataset[] | ConcreteErrorCreator>;
    createTags(tags: string[], datasetId: number): Promise<Tag[]>;
    listAiModels(): Promise<Ai[] | ConcreteErrorCreator>;
    findModel(modelId: number): Promise<Ai | ConcreteErrorCreator>;
    findResult(resultId: number): Promise<Result | ConcreteErrorCreator>;
    listImageFromDataset(datasetId: number): Promise<Image[] | ConcreteErrorCreator>;
    createDatasetWithTags(data: any, user: User): Promise<Dataset> ;
    getDatasetDetail(datasetId: number): Promise<Dataset | ConcreteErrorCreator> ;
    logicallyDelete(datasetId: number): Promise<SuccessResponse | ConcreteErrorCreator>;
    updateModelWeights(modelId: number, weights: string ): Promise<Ai | ConcreteErrorCreator>;
    findDatasetById(datasetId: number): Promise<Dataset | ConcreteErrorCreator>;
    createImage(data: any): Promise<Image | null>;
    createDestinationRepo(datasetId: number): Promise<string | ConcreteErrorCreator> ;
    processZipEntries(datasetId: number, zipEntries: IZipEntry[], destination: string): Promise<void | ConcreteErrorCreator>;
    updateUserTokenByCost(user: User, cost: number): Promise<void>;
    checkUserToken(userId: number, amount: number): Promise<boolean>;
    generateUUID(): Promise<string>;
    getTags(datasetId: number): Promise<string[]>;
    updateCountDataset(datasetId: number, num: number): Promise<Dataset|ConcreteErrorCreator>;
    createListResult(imageList: Image[], aiID: number, UUID: string): Promise<Result[] | ConcreteErrorCreator>;
    checkNames(userId: number, newName: string): Promise<boolean | ConcreteErrorCreator>;
}
```

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

# API Testing with Postman

## Prerequisites

Make sure you have Postman installed on your computer. You can download it from the [official Postman website](https://www.postman.com/downloads/).

## Importing the Postman Collection

1. **Download the Postman Collection**: Locate the Postman collection file (.json) included in the repository.
2. **Import the Collection into Postman**:
   - Open Postman.
   - Click on `Import` in the top left menu.
   - Select `File` and upload the downloaded collection file.
3. **Environment (optional)**: If there is a Postman environment file (.json), import it following the same procedure.

## Running the Tests

1. **Select the Collection**: In the Postman sidebar, find the imported collection.
2. **Configure the Environment (if necessary)**:
   - Click on the environment dropdown in the top right corner.
   - Select the imported environment or manually configure the necessary variables.
3. **Run the Tests**:
   - Expand the collection and select the request you want to test.
   - Click on `Send` to send the request and view the response.
   - To run all tests in the collection sequentially, click the `Run` button at the top of the collection and follow the instructions.

## Test Automation

If you want to run the tests automatically, you can use Postman's runner feature:

1. **Open the Collection Runner**:
   - Click on `Runner` in the top menu.
2. **Select the Collection**:
   - Choose the imported collection.
3. **Configure the Options**:
   - Select the environment (if applicable).
   - Configure the number of iterations, delays between requests, etc.
4. **Run the Tests**:
   - Click on `Run` to start executing the tests.

## Important Notes

- **Authentication**: Ensure you correctly configure any authentication tokens or credentials required to execute the requests.
- **Environment Variables**: Use environment variables to manage endpoints, credentials, and other configurations that may vary between different environments (development, testing, production).
- **Expected Responses**: Verify that the API responses conform to the expectations defined in the Postman tests. Postman test scripts can be used to automate these verifications.

## Testing single routes

### Check Health

**Endpoint**: `localhost:3000/check/health`

**Method**: `GET`

**Purpose**: This route is used to check if the system is ready.

**Expected Output**:
```json
{
    "system": "online"
}
```

### Generate Token (user and admin)

**Endpoint**: `localhost:3000/api/generate/token/4`

**Method**: `GET`

**Purpose**: This route is used to generate a token for users or admin.

**Params**:
   - userId

**Expected Output**:
```json
{
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImEubm5hQGZpdC5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MTgwMTI0OTcsImV4cCI6MTcxODA5ODg5NywiaXNzIjoiSW50ZWxsaWluZmVyQXBpIn0.B1y55vZrwBJ3MJnZWFXLTF0A6_noco29fAp9tdZ5GUmoF7Cq9-sB8AjaKl1Lx-kq9RNfKNV19Ec8_5joLmB0uDix0OZT0Q4_cY0HqXGt0MFZH2n4JaEh8zW-lsSkEi5tYEmAY3jRmJahbXH13aFG8yLzrhd7HGYwTbZeNxnfmsQsPpv61MKNIk1LSvMJg7OhFWWrgbU7yenhnEHFIjBycxvWHPljRVP2aQhmzVrnFH8bZNWe5kBAuLMS9R4gsl7PTDPY-6L_S9HZJTcR0t334kptwGGRnJ4pbyl2bK4HDIHkYnq4uBBrAaWoaaaimMiiMA-ZQ_Ef--wINp3TISEUSw"
}
```

### Route 404

**Endpoint**: `localhost:3000/api/no_route`

**Method**: `GET`

**Purpose**: Check non existent route

**Expected Output**:
```json
{
    "success": false,
    "message": "No route found."
}
```

### List models

**Endpoint**: `localhost:3000/api/model/list`

**Method**: `GET`

**Purpose**: Route used by users to display all available AI models

**Expected Output**:
```json
{
    "success": true,
    "message": "Model list",
    "obj": [
        {
            "id": 1,
            "name": "Yolov5",
            "description": "Yolov5 neural network for detection tasks",
            "pathweights": "/primo/path/esempio",
            "architecture": "yolo",
            "created_at": "2024-06-10T09:18:17.514Z",
            "updated_at": "2024-06-10T09:18:17.514Z"
        },
        {
            "id": 2,
            "name": "TestNN",
            "description": "Test script to emulate a neural network..",
            "pathweights": "/primo/path/esempio",
            "architecture": "test",
            "created_at": "2024-06-10T09:18:17.514Z",
            "updated_at": "2024-06-10T09:18:17.514Z"
        }
    ]
}
```

### Find model by id

**Endpoint**: `localhost:3000/api/model/1`

**Method**: `GET`

**Purpose**: This route is used by users to find n AI model, given its id

**Params**:
   - modelId

**Expected Output**:
```json
{
    "success": true,
    "message": "Model detail",
    "obj": {
        "id": 1,
        "name": "Yolov5",
        "description": "Yolov5 neural network for detection tasks",
        "pathweights": "/primo/path/esempio",
        "architecture": "yolo",
        "created_at": "2024-06-10T09:18:17.514Z",
        "updated_at": "2024-06-10T09:18:17.514Z"
    }
}
```

### Change model weights

**Endpoint**: `localhost:3000/admin/model/1/change/weights`

**Method**: `PUT`

**Purpose**: This route is used by admin to update weights' path of an AI model

**Params**:
- modelId

**Body** (form-data):
- `key` : weightsfile
- `value`: best.pt file provided by project developers or any other .pt weights file

**Expected Output**:
```json
{
    "success": true,
    "message": "Weights uploaded successfully"
}
```

### Recharge Credit

**Endpoint**: `localhost:3000/admin/credit/recharge`

**Method**: `PUT`

**Purpose**: This route is used by the admin to recharge user's credit

**Body** (JSON):
```json
{
    "email": "marco.cc@mio.com",
    "tokensToAdd": 30
}
```

**Expected Output**:
```json
{
    "success": true,
    "message": "Credit recharged successfully",
    "obj": {
        "id": 1,
        "username": "Marco",
        "email": "marco.cc@mio.com",
        "token": 45,
        "role": "user",
        "created_at": "2024-06-10T09:18:17.510Z",
        "updated_at": "2024-06-10T10:16:51.385Z"
    }
}
```

### Create Dataset

**Endpoint**: `localhost:3000/api/dataset/create`

**Method**: `POST`

**Purpose**: This route is used by users to create a new dataset

**Body** (JSON):
```json
{
    "name": "Food",
    "description": "Collection of images of various types of food",
    "tags": ["fish", "chips", "pizza"]
}
```

**Expected Output**:
```json
{
    "success": true,
    "message": "Dataset created successfully",
    "obj": {
        "isDeleted": false,
        "id": 4,
        "name": "Food",
        "description": "Collection of images of various types of food",
        "path": "/food",
        "countElements": 0,
        "countClasses": 3,
        "userId": 1,
        "updated_at": "2024-06-10T10:24:25.836Z",
        "created_at": "2024-06-10T10:24:25.836Z",
        "deleted_at": null
    }
}
```

### Get Dataset by id

**Endpoint**: `localhost:3000/api/dataset/1`

**Method**: `GET`

**Purpose**: This route is used by users to find a dataset given its id

**Params**:
- datasetId

**Body** (form-data):
- `key` : weightsfile
- `value`: best.pt file provided by project developers or any other .pt weights file

**Expected Output**:
```json
{
    "success": true,
    "message": "Dataset detail",
    "obj": {
        "id": 1,
        "userId": null,
        "name": "Ships",
        "path": "/ships",
        "countElements": 100,
        "countClasses": 5,
        "description": "Dataset of Sar images for ships detection",
        "isDeleted": false,
        "created_at": "2024-06-10T09:18:17.518Z",
        "updated_at": "2024-06-10T09:18:17.518Z",
        "deleted_at": null
    }
}
```

### List datasets

**Endpoint**: `localhost:3000/api/dataset/list`

**Method**: `GET`

**Purpose**: This route is used by users to display all of their datasets

**Expected Output**:
```json
{
    "success": true,
    "message": "Dataset list",
    "obj": [
        {
            "id": 4,
            "userId": 1,
            "name": "Food",
            "path": "/food",
            "countElements": 0,
            "countClasses": 3,
            "description": "Collection of images of various types of food",
            "isDeleted": false,
            "created_at": "2024-06-10T10:24:25.836Z",
            "updated_at": "2024-06-10T10:24:25.836Z",
            "deleted_at": null
        }
    ]
}
```

### Update dataset's name

**Endpoint**: `localhost:3000/api/dataset/update/4`

**Method**: `PUT`

**Purpose**: This route is used by users to change the name of one of their datasets, only if it isn't already used by others.

**Params**:
- datasetId

**Body** (JSON):
```json
{
    "name": "Flowers"
}
```

**Expected Output**:
```json
{
    "success": true,
    "message": "Dataset updated successfully",
    "obj": {
        "id": 4,
        "userId": 1,
        "name": "Flowers",
        "path": "/food",
        "countElements": 0,
        "countClasses": 3,
        "description": "Collection of images of various types of food",
        "isDeleted": false,
        "created_at": "2024-06-10T10:24:25.836Z",
        "updated_at": "2024-06-10T10:34:58.129Z",
        "deleted_at": null
    }
}
```

### Logically delete dataset

**Endpoint**: `localhost:3000/api/dataset/delete/1`

**Method**: `DELETE`

**Purpose**: This route is used by users to logically delete a dataset, setting "isDeleted" to true.

**Params**:
- datasetId

**Expected Output**:
```json
{
    "success": true,
    "message": "Dataset deleted successfully.",
    "obj": {
        "success": true,
        "message": "deleted successfully",
        "obj": {
            "id": 1,
            "name": "Ships",
            "path": "/ships",
            "description": "Dataset of Sar images for ships detection",
            "created_at": "2024-06-10T09:18:17.518Z",
            "updated_at": "2024-06-10T10:38:14.962Z",
            "deleted_at": null,
            "userId": null,
            "countElements": 100,
            "countClasses": 5,
            "isDeleted": true
        }
    }
}
```

### Display user's credit

**Endpoint**: `localhost:3000/api/display/credit`

**Method**: `GET`

**Purpose**: This route is used by users to check their remaining credit.

**Expected Output**:
```json
{
    "success": true,
    "message": "Token credit",
    "obj": {
        "userEmail": "marco.cc@mio.com",
        "token": 45
    }
}
```

### Upload file

**Endpoint**: `localhost:3000/api/dataset/4/upload/file`

**Method**: `POST`

**Purpose**: This route is used by users to upload an image or a file zip on a dataset, if they have sufficient tokens.

**Params**:
- datasetId

**Body** (form-data):
- `key` : file
- `value`: file .jpg, .png, .zip

**Expected Output**:
```json
{
    "success": true,
    "message": "File uploaded successfully"
}
```

### Init Inference

**Endpoint**: `http://localhost:3000/api/inference/4/1/`

**Method**: `GET`

**Purpose**: This route is used by users to start the inference of a dataset on a specific AI model

**Params**:
- datasetId
- modelId

**Expected Output**:
```json
{
    "success": true,
    "message": "start inference on your dataset",
    "obj": {
        "jobId": "1",
        "datasetName": "Flowers",
        "architecture": "yolo"
    }
}
```

### Display Inference State

**Endpoint**: `http://localhost:3000/api/inference/get/status/29`

**Method**: `GET`

**Purpose**: This route is used by users to check the state of an inference

**Params**:
- jobId

**Expected Output**:
```json
{
    "success": true,
    "message": "COMPLETED",
    "obj": {
        "jobId": "2",
        "results": [
            {
                "id": 2,
                "imageId": 1,
                "aiId": 1,
                "data": {
                    "box": [
                        {
                            "width": 80,
                            "height": 80,
                            "class_id": 2,
                            "x_center": 63,
                            "y_center": 93,
                            "confidence": 0.08
                        }
                    ],
                    "error": null,
                    "start": false,
                    "finish": true
                },
                "requestId": "0c55b4ac-7881-4904-a64f-6748ad74dd83",
                "created_at": "2024-06-10T10:55:58.093Z",
                "updated_at": "2024-06-10T10:55:58.807Z"
            }
        ]
    }
}
```





















  
# Authors
This project is developed and maintained by the following authors:

- **Zazzarini Micol** - [GitHub Profile](https://github.com/MicolZazzarini)
- **Fiorani Andrea** - [GitHub Profile](https://github.com/125ade)

# License
This project is licensed under the [MIT License](LICENSE) - consulta il file [LICENSE](LICENSE) per ulteriori dettagli.


