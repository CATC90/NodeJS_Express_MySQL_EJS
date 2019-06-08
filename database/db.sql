Create database videoJuegos;

use videoJuegos;

create table users(
    id int(11) auto_increment primary key,
    username varchar(20) not null,
    password varchar(20) not null,
    fullname varchar(100) not null
);

describe users;

--videoJuegos tables

create table Juego(
    id int(11) auto_increment primary key,
    title varchar(100) not null,
    photo bigint,
    description text not null,
    user_id int(11),
    created_at timestamp not null default current_timestamp,
    constraint fkUserJuego foreign key (user_id) references users(id) 
);

--user tables

create table user(
    id int(11) auto_increment primary key,
    rut char(10) not null,
    email varchar(50) not null,
    fullname varchar(100) not null,
    user_type varchar(30) not null,
    avatar varchar(100),
    created_at timestamp not null default current_timestamp,
    UNIQUE KEY unique_rut (rut),
    UNIQUE KEY unique_email (email)
);

--Plataforms

Create table plataforms(id int(3) auto_increment primary key, description varchar(20));
insert into plataforms(description) values('NSwitch');
insert into plataforms(description) values('PS4');
insert into plataforms(description) values('XboxOne');
insert into plataforms(description) values('PC');

alter table Juego add column plataform int(3);
alter table Juego add constraint fkPlataformaJuego foreign key(plataform) references plataforms(id); 
alter table Juego drop foreign key `fkPlataformaJuego`;

alter table Juego modify column photo varchar(100);

-- create review table

create table review(
id int(11) auto_increment primary key, 
info text,
created_at timestamp not null default current_timestamp,
game int(11), constraint fkGameReview foreign key (game) references Juego(id));



-- Break n:n
create table plataformsJuego(idJuego int(11), idPlataform int(3), constraint fkJuego foreign key(idJuego) references Juego(id), constraint fkPlataform foreign key(idPlataform) references plataforms(id));

--trigger

create trigger reviewPhotoName after insert on review for each row update review set review_photo = new.id+'.jpg';