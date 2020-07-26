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
            skill_name: "",
            name: "",
            records: [],
            exec_time: 0
        };
        res.render('skill', opt);
    } else {
        db.insert_query("skill", req.ip, req.query);

        skill_name = "";
        if(req.query['skill_name']){
            skill_name = req.query['skill_name'];
        }
        skill_name_match = "";
        if(req.query['skill_name_match']){
            skill_name_match = req.query['skill_name_match'];
        }
        name = "";
        if(req.query['name']){
            name = req.query['name'];
        }
        
        // PostgreSQLからのデータ取得
        var pg_db = new db();
        
        pg_db.client.connect( function(err, client) {
            query = ' select a.skill_name, array_agg(a.name order by a.name) as name,' +
                    " array_agg(case when a.type = 'characteristic' then '特性' else '特技' end order by a.name) as type, " + 
                    " array_agg(case when a.has_turn = true then '有' else '無' end order by a.name) as has_turn," +
                    " array_agg(a.effect order by a.name) as effect " + 
                    " from special_char a join skill b on a.skill_name = b.name " +
                    " where (1=1) and (skill_name is not null) ";
            if(skill_name_match != ''){
                query = query.concat(" and (a.skill_name = " +  escape.literal(skill_name_match) + ") ");
            }
            if(skill_name != ''){
                query = query.concat(" and ((1 = 0)");
                const skill_names = skill_name.split(/\s/);
                skill_names.forEach( item => 
                    query = query.concat(" or b.name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")");
            }
            if(name != ''){
                query += " and skill_name in (select skill_name from special_char where  "
                query = query.concat(" (1 = 0) ");
                const names = name.split(/\s/);
                names.forEach( item => 
                    query = query.concat(" or name_kana like '%' || " + escape.literal(db.kana(item)) + " || '%'" ));
                query = query.concat(")");
            }
            query += ' group by 1';
            if (err) {
                console.log(err);
            } else {
                //console.log(query);
                client.query(query, function (err, result) {
                if (err) {
                    console.log(err.stack);
                } else {
                    var end = new Date() - start;
                    let opt = {
                        skill_name: skill_name,
                        name: name,
                        records: result.rows,
                        exec_time: end
                    };
                    res.render('skill', opt);
                }
              });
            }
        });
    }
});

module.exports = router;
