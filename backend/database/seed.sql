-- Creazione della tabella users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    token DECIMAL NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Creazione della tabella ai
CREATE TABLE ai (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(300),
    pathweights VARCHAR(300) NOT NULL,
    architecture VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Creazione della tabella datasets
CREATE TABLE datasets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- ci sarà in seguito da aggiungere il not null
    name VARCHAR(255) NOT NULL,
    path VARCHAR(255) NOT NULL,
    count_elements INTEGER NOT NULL,
    count_classes INTEGER NOT NULL,
    description VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE, -- Add the new field
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Aggiunta del vincolo di chiave esterna per user_id
ALTER TABLE datasets
ADD CONSTRAINT fk_user_id
FOREIGN KEY (user_id)
REFERENCES users(id);

-- Creazione della tabella tags
CREATE TABLE tags (
    name VARCHAR(255) PRIMARY KEY NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Creazione della tabella DatasetTags per la relazione molti-a-molti tra datasets e tags
CREATE TABLE datasetstags (
    dataset_id INTEGER NOT NULL,
    tag_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (dataset_id, tag_id),
    FOREIGN KEY (dataset_id) REFERENCES datasets(id),
    FOREIGN KEY (tag_id) REFERENCES tags(name) -- Cambiato da 'tags(id)' a 'tags(name)'
);

-- Creazione della tabella images
CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL,
    path VARCHAR(300) NOT NULL,
    description VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aggiunta del vincolo di chiave esterna per dataset_id
ALTER TABLE images
ADD CONSTRAINT fk_dataset_id
FOREIGN KEY (dataset_id)
REFERENCES datasets(id);

-- Creazione della tabella labels
CREATE TABLE labels (
    id SERIAL PRIMARY KEY,
    dataset_id INTEGER NOT NULL,
    image_id INTEGER NOT NULL,
    path VARCHAR(300) NOT NULL,
    description VARCHAR(300),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aggiunta dei vincoli di chiave esterna per dataset_id e image_id
ALTER TABLE labels
ADD CONSTRAINT fk_dataset_id
FOREIGN KEY (dataset_id)
REFERENCES datasets(id);

ALTER TABLE labels
ADD CONSTRAINT fk_image_id
FOREIGN KEY (image_id)
REFERENCES images(id);

-- Creazione della tabella results
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    image_id INTEGER NOT NULL,
    ai_id INTEGER NOT NULL,
    data JSONB NOT NULL,
    request_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Aggiunta dei vincoli di chiave esterna per image_id e ai_id
ALTER TABLE results
ADD CONSTRAINT fk_image_id
FOREIGN KEY (image_id)
REFERENCES images(id);

ALTER TABLE results
ADD CONSTRAINT fk_ai_id
FOREIGN KEY (ai_id)
REFERENCES ai(id);

-- Inserimento di un elemento nella tabella ai
INSERT INTO ai (name, description, pathweights, architecture) 
VALUES ('Yolov5', 'Yolov5 neural network for detection tasks', '/primo/path/esempio', 'yolo');

-- Insert seed data into datasets
INSERT INTO datasets (name, path, count_elements, count_classes, description, is_deleted) VALUES
('Ships', '/ships', 100, 5, 'Dataset of Sar images for ships detection', FALSE),
('Dogs', '/dogs', 200, 10, 'Dataset of images for dogs detection', FALSE),
('Cats', '/cats', 150, 8, 'Dataset of images for cats detection', FALSE);



