CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE ai (
    id INTEGER PRIMARY KEY,
    name CHAR(200) NOT NULL,
    description CHAR(300),
    path_weights CHAR(300) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE datasets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    count_elements INTEGER NOT NULL,
    count_classes INTEGER NOT NULL,
    description VARCHAR(255),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL,
    path VARCHAR(300) NOT NULL,
    description VARCHAR(300),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id)
);

CREATE TABLE labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    path VARCHAR(300) NOT NULL,
    description VARCHAR(300),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id),
    FOREIGN KEY (image_id) REFERENCES images(id)
);

CREATE TABLE results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    image_id INTEGER NOT NULL,
    ai_id INTEGER NOT NULL,
    data JSONB NOT NULL,
    request_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (image_id) REFERENCES images(id),
    FOREIGN KEY (ai_id) REFERENCES Ai(id)
);

CREATE TABLE tags (
    name VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE datasetstags (
    dataset_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    PRIMARY KEY (dataset_id, tag_id),
    FOREIGN KEY (dataset_id) REFERENCES datasets(id),
    FOREIGN KEY (tag_id) REFERENCES Tags(id)
);