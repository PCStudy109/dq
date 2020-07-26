var express = require('express');
var router = express.Router();
const db = require('./db.js');
var escape = require('pg-escape');

router.get('/', function(req, res, next) {
    var rows = [];
    var records = [];
    var types = [];
    var types = [];
    
    var start = new Date();
    // クエリパラメータの解析
    if (Object.keys(req.query).length == 0){
        let opt = {
            name: "",
            types: [],
            categories: [],
            attribute: "",
            turns: [],
            targets: [],
            effect: "",
            skill_name: "",
            monster_name: "",
            records: [],
            exec_time: 0
        };
        res.render('speciality', opt);
    } else {
        db.insert_query("speciality", req.ip, req.query);

        name = "";
        if(req.query['name']){
            name = req.query['name'];
        }
        name_match = "";
        if(req.query['name_match']){
            name_match = req.query['name_match'];
        }
        types = [];
        if(req.query['type']){
            types = types.concat(req.query['type']);
        }
        categories = [];
        if(req.query['category']){
            categories = categories.concat(req.query['category']);
        }
        attribute = "";
        if(req.query['attribute']){
            attribute = req.query['attribute'];
        }
        turns = [];
        if(req.query['turn']){
            turns = turns.concat(req.query['turn']);
        }
        targets = [];
        if(req.query['target']){
            targets = targets .concat(req.query['target']);
        }
        effect = ""
        if(req.query['effect']){
            effect = req.query['effect'];
        }
        skill_name = "";
        if(req.query['skill_name']){
            skill_name = req.query['skill_name'];
        }
        monster_name = "";
        if(req.query['monster_name']){
            monster_name = req.query['monster_name'];
        }
        // PostgreSQLからのデータ取得
        var pg_db = new db();
        pg_db.client.connect( function(err, client) {
            query = "select name, case when type = 'characteristic' then '特性' else '特技' end as type," +
                    " case when has_turn = true then '有' else '無' end as has_turn," + 
                    ' category, attribute, target, consume_mp, effect, ' + 
                    ' (array_remove((array_agg(distinct skill_name order by skill_name)::text[]), NULL)::text[])[1:3] as skill_name, ' +
                    ' array_length((array_agg(distinct skill_name)::text[]), 1) > 3 as skill_more, ' + 
                    ' (array_remove((array_agg(distinct monster_name order by monster_name)::text[]), NULL)::text[])[1:3] as monster_name,' +
                    ' array_length(array_agg(distinct monster_name)::text[], 1) > 3 as monster_more ' +
                    ' from special_char a where (1 = 1) ' ;
            if(name_match != ''){
                query = query.concat(" and (name = ");
                const name_matchs = name_match.split(/\s/);
                for (let i = 0; i < name_matchs.length; i++) {
                    if(i == 0){
                        query = query.concat("'" + name_matchs[i] + "'");
                    } else {
                        query = query.concat(" || '+" + name_matchs[i] + "'");
                    }
                }
                query = query.concat(")");
            }
            if(name != ''){
                query += " and ((1 = 0) ";
                const names = name.split(/\s/);
                names.forEach( item => 
                    query = query.concat(" or name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")");
            }
            if(types.length != 0){
                query = query.concat(" and ((type is null)");
                types.forEach( function(item){
                    type = (item == '特技') ? 'speciality': 'characteristic';
                    query = query.concat(" or type = " + escape.literal(type) );
                });
                query = query.concat(")");
            }
            if(turns.length != 0){
                query = query.concat(" and ((has_turn is null)");
                turns.forEach( function(item){
                    turn = (item == '有') ? 'true': 'false';
                    query = query.concat(" or has_turn = " + turn);
                });
                query = query.concat(")");
            }
            if(categories.length != 0){
                query = query.concat(" and ((category is null)");
                categories.forEach( function(item){
                    query = query.concat(" or category = " + escape.literal(item));
                });
                query = query.concat(")");
            }
            if(targets.length != 0){
                query = query.concat(" and ((target is null)");
                targets.forEach( function(item){
                    query = query.concat(" or target = " + escape.literal(item));
                });
                query = query.concat(")");
            }
            if(effect != ''){
                query += " and ((1 = 0) ";
                const effects = effect.split(/\s/);
                effects.forEach( item => 
                    query = query.concat(" or effect_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")");
            }
            if(attribute != ''){
                query += " and ((1 = 0) ";
                const attributes = attribute.split(/\s/);
                attributes.forEach( item => query = query.concat(" or attribute like '%' || " + escape.literal(item) + " || '%'" ));
                query = query.concat(")");
            }
            if(monster_name != ''){
                query += " and (type = 'characteristic' and name in (select char_name from monster_char a "
                    + " join monster b on a.monster_name = b.name where  "
                query = query.concat(" ((1 = 0)");
                const monster_names = monster_name.split(/\s/);
                monster_names.forEach( item => 
                    query = query.concat(" or b.name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")))");
            }
            if(skill_name != ''){
                query += " and ((type = 'characteristic' and name in (select char_name from skill_char a "
                    +" join skill b on a.skill_name = b.name where  "
                query = query.concat(" ((1 = 0)");
                const skill_names = skill_name.split(/\s/);
                skill_names.forEach( item => 
                    query = query.concat(" or b.name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")))");

                query += " or (type = 'speciality' and name in (select special_name from skill_special a "
                 + " join skill b on a.skill_name = b.name where  "
                query = query.concat(" ((1 = 0)");
                skill_names.forEach( item => 
                    query = query.concat(" or b.name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat("))))");
            }
            query += ' group by 1, 2, 3, 4, 5, 6, 7, 8 ';
            if (err) {
                console.log(err);
            } else {
                client.query(query, function (err, result) {
                if (err) {
                    console.log(err.stack);
                } else {
                    var end = new Date() - start;
                    let opt = {
                        name: name,
                        types: types,
                        categories: categories,
                        attribute: attribute,
                        turns: turns,
                        targets: targets,
                        effect: effect,
                        skill_name: skill_name,
                        monster_name: monster_name,
                        records: result.rows,
                        exec_time: end
                    };
                    res.render('speciality', opt);
                }
              });
            }
        });
    }
});

module.exports = router;
