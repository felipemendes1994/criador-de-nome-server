create schema namegator;

create table namegator.item(id serial,type text not null,description text not null);

insert into namegator.item(type, description) values ('prefix', 'samu');
insert into namegator.item(type, description) values ('sufix', 'elson');