create table USERS (username varchar(255) not null primary key, password varchar(255));

--username VARCHAR, foreign key
--message VARCHAR
--timestamp time
create table POSTS (username varchar(255), message varchar(255), timestamp timestamp, foreign key (username) references users(username));

--drop tables
drop table posts;
drop table users;

--different types of select statements
select * from users;
select * from posts;
select username from users;
select message from posts;

--insert into users
insert into users (username, password) values ('user1', 'password1');

--insert into posts
insert into posts (username, message, timestamp) values ('user1', 'message1', now());

--delete a user
delete from users where username = 'user2';