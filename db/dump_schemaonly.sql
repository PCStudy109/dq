--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attribute (
    name text NOT NULL,
    type text,
    description text
);


ALTER TABLE public.attribute OWNER TO postgres;

--
-- Name: char; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."char" (
    name text NOT NULL,
    effect text,
    name_kana text,
    effect_kana text
);


ALTER TABLE public."char" OWNER TO postgres;

--
-- Name: monster; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster (
    name text NOT NULL,
    url text,
    size text,
    hp text,
    guard text,
    mp text,
    agility text,
    attack text,
    wisdom text,
    name_kana text
);


ALTER TABLE public.monster OWNER TO postgres;

--
-- Name: monster_attribute; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_attribute (
    monster_name text NOT NULL,
    attribute_name text NOT NULL,
    degree integer NOT NULL,
    degree_name text NOT NULL
);


ALTER TABLE public.monster_attribute OWNER TO postgres;

--
-- Name: monster_char; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.monster_char (
    monster_name text NOT NULL,
    char_name text NOT NULL,
    char_name_kana text
);


ALTER TABLE public.monster_char OWNER TO postgres;

--
-- Name: skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill (
    name text NOT NULL,
    name_kana text
);


ALTER TABLE public.skill OWNER TO postgres;

--
-- Name: skill_char; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill_char (
    skill_name text NOT NULL,
    char_name text NOT NULL
);


ALTER TABLE public.skill_char OWNER TO postgres;

--
-- Name: skill_special; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill_special (
    skill_name text,
    special_name text,
    effect text,
    url text
);


ALTER TABLE public.skill_special OWNER TO postgres;

--
-- Name: special; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.special (
    name text NOT NULL,
    category text,
    consume_mp text,
    target text,
    attribute text,
    effect text,
    url text,
    has_turn boolean,
    name_kana text,
    category_kana text,
    target_kana text,
    attribute_kana text,
    effect_kana text
);


ALTER TABLE public.special OWNER TO postgres;

--
-- Name: special_char; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.special_char AS
 SELECT a.name,
    a.name_kana,
    'speciality'::text AS type,
    a.has_turn,
    a.category,
    a.attribute,
    a.target,
    a.consume_mp,
    a.effect,
    a.effect_kana,
    b.skill_name,
    c.name_kana AS skill_name_kana,
    NULL::text AS monster_name
   FROM ((public.special a
     LEFT JOIN public.skill_special b ON ((a.name = b.special_name)))
     LEFT JOIN public.skill c ON ((b.skill_name = c.name)))
UNION ALL
 SELECT a.name,
    a.name_kana,
    'characteristic'::text AS type,
    false AS has_turn,
    NULL::text AS category,
    NULL::text AS attribute,
    NULL::text AS target,
    '0'::text AS consume_mp,
    a.effect,
    a.effect_kana,
    NULL::text AS skill_name,
    NULL::text AS skill_name_kana,
    b.monster_name
   FROM (public."char" a
     LEFT JOIN public.monster_char b ON ((a.name = b.char_name)))
UNION ALL
 SELECT a.name,
    a.name_kana,
    'characteristic'::text AS type,
    false AS has_turn,
    NULL::text AS category,
    NULL::text AS attribute,
    NULL::text AS target,
    '0'::text AS consume_mp,
    a.effect,
    a.effect_kana,
    b.skill_name,
    c.name_kana AS skill_name_kana,
    NULL::text AS monster_name
   FROM ((public."char" a
     LEFT JOIN public.skill_char b ON ((a.name = b.char_name)))
     LEFT JOIN public.skill c ON ((b.skill_name = c.name)));


ALTER TABLE public.special_char OWNER TO postgres;

--
-- Name: attribute attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attribute
    ADD CONSTRAINT attribute_pkey PRIMARY KEY (name);


--
-- Name: char characteristic_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."char"
    ADD CONSTRAINT characteristic_pkey PRIMARY KEY (name);


--
-- Name: monster_attribute monster_attribute_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_attribute
    ADD CONSTRAINT monster_attribute_pkey PRIMARY KEY (monster_name, attribute_name);


--
-- Name: monster monster_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster
    ADD CONSTRAINT monster_pkey PRIMARY KEY (name);


--
-- Name: skill_char skill_char_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_char
    ADD CONSTRAINT skill_char_pkey PRIMARY KEY (skill_name, char_name);


--
-- Name: skill skill_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT skill_pkey PRIMARY KEY (name);


--
-- Name: special special_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.special
    ADD CONSTRAINT special_pkey PRIMARY KEY (name);


--
-- Name: monster_attribute monster_attribute_monster_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_attribute
    ADD CONSTRAINT monster_attribute_monster_name_fkey FOREIGN KEY (monster_name) REFERENCES public.monster(name);


--
-- Name: monster_char monster_char_char_name_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_char
    ADD CONSTRAINT monster_char_char_name_fkey1 FOREIGN KEY (char_name) REFERENCES public."char"(name) ON UPDATE CASCADE;


--
-- Name: monster_char monster_char_monster_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.monster_char
    ADD CONSTRAINT monster_char_monster_name_fkey FOREIGN KEY (monster_name) REFERENCES public.monster(name) ON DELETE CASCADE;


--
-- Name: skill_char skill_char_char_name_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_char
    ADD CONSTRAINT skill_char_char_name_fkey1 FOREIGN KEY (char_name) REFERENCES public."char"(name) ON UPDATE CASCADE;


--
-- Name: skill_char skill_char_skill_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill_char
    ADD CONSTRAINT skill_char_skill_name_fkey FOREIGN KEY (skill_name) REFERENCES public.skill(name);


--
-- Name: TABLE attribute; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.attribute TO dquser;


--
-- Name: TABLE "char"; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public."char" TO dquser;


--
-- Name: TABLE monster; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.monster TO dquser;


--
-- Name: TABLE monster_attribute; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.monster_attribute TO dquser;


--
-- Name: TABLE monster_char; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.monster_char TO dquser;


--
-- Name: TABLE skill; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.skill TO dquser;


--
-- Name: TABLE skill_char; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.skill_char TO dquser;


--
-- Name: TABLE skill_special; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.skill_special TO dquser;


--
-- Name: TABLE special; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.special TO dquser;


--
-- Name: TABLE special_char; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT ON TABLE public.special_char TO dquser;


--
-- PostgreSQL database dump complete
--

