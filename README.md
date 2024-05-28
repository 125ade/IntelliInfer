<div style="text-align: center;">
  <img src="documents/logoIntelliInfer.jpg" alt="Logo IntelliInfer" style="max-width: 256 px; height: auto;">
</div>

# IntelliInfer

The IntelliInfer project, developed for the Advanced Programming exam at the Polytechnic University of the Marche (UNIVPM) during the academic year 2023-2024, represents an advanced API for managing datasets and executing inferences based on artificial intelligence models. This project was conceived to facilitate interaction with data and leverage the power of artificial intelligence to extract meaningful information from it. It was developed during the Master's degree program in Computer Engineering and Automation.


# Project Goal

The main goal of IntelliInfer is to provide an API for loading datasets, managing them, and using AI models to perform inference. Users can upload their datasets and utilize the available models to make predictions on new data.

# Design

## Rotte

| Token | Funzione                                          | Ruolo  |
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
| Yes | show the inference results                        | user   |
| Yes | check user’s remaining credit                     | user   |
| Yes | save inference results                            | system |


| Type  | Rotta                                            |
|-------|--------------------------------------------------|
| PUT   | /credit/recharge/{userId}                        |
| PUT   | /model/{aiId}/change/weights                     |
| GET   | /model/list                                      |
| GET   | /model/{modelId}                                 |
| GET   | /dataset/list                                    |
| GET   | /dataset/{datasetId}                             |
| POST  | /dataset/create                                  |
| PUT   | /dataset/{datasetId}/update                      |
| DELETE| /dataset/{datasetId}/delete                      |
| POST  | /dataset/{datasetId}/upload  (zip & img)         |
| POST  | /inference/{datasetId}/{aiId}/                   |
| GET   | /inference/state/{resoultId}                     |
| GET   | /inference/result/{resoultId}                    |
| POST  | /inference/result/{resoultId}  (callback)        |


## Uses Case Diagram
<div style="text-align: center;">
  <img src="documents/UsesCaseDiagram.png" alt="Uses Case Diagram" style="max-width: 256 px; height: auto;">
</div>

# db design

## ER Schema
<div style="text-align: center;">
  <img src="documents/ERscheme.png" alt="ER schema" style="max-width: 256 px; height: auto;">
</div>

## Database Schema
<div style="text-align: center;">
  <img src="documents/DatabaseSchema.png" alt="Database Schema" style="max-width: 256 px; height: auto;">
</div>
