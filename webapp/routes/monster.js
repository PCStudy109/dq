var express = require('express');
var router = express.Router();
var db = require('./db.js');
var escape = require('pg-escape');

router.get('/', function(req, res, next) {
    var rows = [];
    var records = [];

    var start = new Date();
    //console.log(req.ip);
    // クエリパラメータの解析
    if (Object.keys(req.query).length == 0){
        let opt = {
            monster_name: "",
            sizes: [],
            char_name: "",
            records: [],
            exec_time: 0
        };
        res.render('monster', opt);
    } else {
        db.insert_query("monster", req.ip, req.query);
        name = "";
        if(req.query['name']){
            name = req.query['name'];
        }
        monster_name = "";
        if(req.query['monster_name']){
            monster_name = req.query['monster_name'];
        }
        char_name = "";
        if(req.query['char_name']){
            char_name = req.query['char_name'];
        }
        sizes = [];
        if(req.query['size'] != undefined){
            sizes = sizes.concat(req.query['size']);
        }
        // PostgreSQLからのデータ取得
        var pg_db = new db();
        
        pg_db.client.connect( function(err, client) {
            query = 'select a.name, a.url, a.size, a.hp, a.mp, a.attack, a.guard, a.agility, a.wisdom, d.tolerance, '
                    + ' array_agg(b.char_name order by b.char_name) as char_name, '
                    + ' array_agg(c.effect order by b.char_name) as char_effect '
                    + ' from monster a '
                    + ' join monster_char b on a.name = b.monster_name ' 
                    + ' join char c on b.char_name = c.name '
                    + ' join '
                    + ' (select monster_name, jsonb_object(array_agg(attribute_name order by attribute_name), '
                    + '         array_agg(degree || \'(\' || degree_name || \')\' order by attribute_name)) tolerance '
                    + ' from monster_attribute group by monster_name) d on a.name = d.monster_name '
                    + ' where 1 = 1 ';
            if(name != ''){
                query = query.concat(" and (a.name = '" + escape.string(name) + "')");
            }
            if(monster_name != ''){
                query = query.concat(" and ((1 = 0)");
                const monster_names = monster_name.split(/\s/);
                monster_names.forEach( item => {
                    query = query.concat(" or a.name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" );
                });
                query = query.concat(")");
            }
            if(char_name != ''){
                query = query.concat(" and a.name in (select monster_name from monster_char a " 
                    + "join char b on a.char_name = b.name where ");
                query = query.concat(" ((1 = 0)");
                const char_names = char_name.split(/\s/);
                char_names.forEach( item => 
                    query = query.concat(" or b.name_kana like '%' || " + escape.literal(db.kana(item)) + "|| '%'" ));
                query = query.concat(")");
                query = query.concat(")");
            }
            if(sizes.length != 0){
                query = query.concat(" and ((a.size is null)");
                sizes.forEach( item => query = query.concat(" or a.size = " + escape.literal(item)));
                query = query.concat(")");
            }
            query += ' group by 1, 2, 3, 4, 5, 6, 7, 8, 9, 10';
            if (err) {
                console.log(err);
            } else {
                client.query(query, function (err, result) {
                if (err) {
                    console.log(err.stack);
                } else {
                    var end = new Date() - start;
                    let opt = {
                        monster_name: monster_name,
                        sizes: sizes,
                        records: result.rows,
                        exec_time: end
                    };
                    res.render('monster', opt);
                }
              });
            }
        });
    }
});

module.exports = router;
