CREATE DATABASE haraka
  WITH OWNER = haraka
       ENCODING = 'UTF8';

CREATE TABLE hosts (
  id serial NOT NULL,
  host text,
  CONSTRAINT hosts_pk_id PRIMARY KEY (id) ) WITH (
  OIDS=FALSE ); ALTER TABLE hosts
  OWNER TO haraka;

CREATE SCHEMA testdomain
  AUTHORIZATION haraka;

CREATE TABLE testdomain.alias (
  id serial NOT NULL,
  name text,
  catchall boolean DEFAULT false,
  CONSTRAINT alias_pk_id PRIMARY KEY (id) ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.alias
  OWNER TO haraka;

CREATE TABLE testdomain.mailbox (
  id serial NOT NULL,
  name text,
  given_name text,
  surname text,
  CONSTRAINT mailbox_pk_id PRIMARY KEY (id) ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.mailbox
  OWNER TO haraka;

CREATE TABLE testdomain.message (
  id integer NOT NULL DEFAULT nextval('testdomain.messages_id_seq'::regclass),
  headers text,
  content_type text,
  body text,
  parts text,
  subject text,
  "to" text,
  "from" text,
  CONSTRAINT messages_pk_id PRIMARY KEY (id) ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.message
  OWNER TO haraka;

CREATE TABLE testdomain.attachment (
  id serial NOT NULL,
  message_id bigint,
  filename text,
  content_type text,
  data text,
  CONSTRAINT attachment_pk_id PRIMARY KEY (id),
  CONSTRAINT attachment_message_id_fk FOREIGN KEY (message_id)
      REFERENCES testdomain.message (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.attachment
  OWNER TO haraka;

CREATE TABLE testdomain.alias_mailbox (
  alias_id bigint,
  mailbox_id integer,
  CONSTRAINT alias_mailbox_alias_fk_id FOREIGN KEY (alias_id)
      REFERENCES testdomain.alias (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT alias_mailbox_mailbox_fk_id FOREIGN KEY (mailbox_id)
      REFERENCES testdomain.mailbox (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.alias_mailbox
  OWNER TO haraka;

CREATE TABLE testdomain.mailbox_message (
  mailbox_id bigint,
  message_id bigint,
  CONSTRAINT mailbox_message_mailbox_id_fk FOREIGN KEY (mailbox_id)
      REFERENCES testdomain.mailbox (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT mailbox_message_message_fk_id FOREIGN KEY (message_id)
      REFERENCES testdomain.message (id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION ) WITH (
  OIDS=FALSE ); ALTER TABLE testdomain.mailbox_message
  OWNER TO haraka;
