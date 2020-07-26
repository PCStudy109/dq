var { Client } = require('pg');
const MongoClient = require('mongodb').MongoClient;
require('date-utils');
const execSync = require('child_process').execSync;
var conf = require('config');

module.exports = class pg{
    constructor(){
        this.client = new Client({
                    database: conf.postgresql.db,
                    user: conf.postgresql.user, 
                    password: conf.postgresql.password, 
                    host: conf.postgresql.host,
                    port: conf.postgresql.port
                });
    }
}

module.exports.insert_query = function(app_name, src_ip, query) {
	var dt = new Date();
	var query_dict = Object.assign(query, { function: app_name, 
		datetime: dt.toFormat("YYYY/MM/DD HH24:MI:SS"), ip: src_ip });
	var url = 'mongodb://' + conf.mongodb.host + ':' + conf.mongodb.port + '/' +  + conf.mongodb.db;
	MongoClient.connect(url, (error, client) => {
	    var collection;
	 
	    // コレクションの取得
	    collection = client.db(conf.mongodb.db).collection(conf.mongodb.collection);
	 
	    // コレクションにドキュメントを挿入
	    collection.insertOne(query_dict, (error, result) => {
			if(error){
				console.log("insert error", error);
			}
	        client.close();
	    });
	});
}

module.exports.kana = function(str){
	cmd = 'java -jar ./sudachi.jar -a | '
		+ 'awk \'BEGIN {FS="\\t"} {if($5 != ""){ print $5 } else { print $4 }}\' | ' 
		+ 'tr -d "\n"';
	result =  execSync(cmd, {cwd : './sudachi', input: str}).toString();
	return result;
}

