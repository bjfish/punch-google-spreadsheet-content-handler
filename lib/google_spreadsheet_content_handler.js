var _ = require("underscore"),
    default_content_handler = require("punch").ContentHandler,
    module_utils = require("punch").Utils.Module,
    url = require("url"),
    Spreadsheet = require("spreadsheet");
;

module.exports = {

    parsers: {},

    spreadsheet: "",
    _spreadsheet: null,
    _paths: [],
    _row_data: [],

    setup: function (config) {

        var self = this;

        _.each(config.plugins.parsers, function (value, key) {
            self.parsers[key] = module_utils.requireAndSetup(value, config);
        });

        default_content_handler.setup(config);

        if (config.google_spreadsheet) {
            self.spreadsheet_key = config.google_spreadsheet.spreadsheet_key || self.spreadsheet_key;
        }

        _spreadsheet = new Spreadsheet(self.spreadsheet_key);

        return self;
    },

    isSection: function (request_path) {
        return false;
    },

    negotiateContent: function (request_path, file_extension, request_options, callback) {
        var self = this;
        var error = null;
        var response_options = {};
        var content = {}
        var last_modified = new Date();
        var getPathData = function(){
            if(self._paths.length > 0 && false){
                content = _.extend(content,{"paths":self._paths} );
//                console.log("contents 1:" + JSON.stringify(content));
                return callback(error, content, response_options, last_modified);
            } else {
                self.getContentPaths('/', function(err, paths){
//                    console.log("geeting paths")
                    content = _.extend(content,{"paths":self._paths} );
//                    console.log("contents 2:" + JSON.stringify(content));
                    return callback(error, content, response_options, last_modified);
                })
            }

        }
        if(request_path == '/index'){
            return getPathData()
        }
//        console.log("path: " + request_path);
        var docId = parseInt(request_path.substr(1), 10);
//        console.log(typeof request_path);
//        console.log("Retrivieng doc id: " + docId);
//        console.log("data: " + JSON.stringify(self._row_data));



        if (self._row_data.length > 0) {
//            console.log("in cache data")
            content = self._row_data[docId - 1];
            if(content.lastupdated){
                last_modified = new Date(content.lastupdated)
             }
//            console.log("in cache data: " + JSON.stringify(content))
            return getPathData();
        } else {
            _spreadsheet.worksheet(1, function (err, ws) {
//                console.log("in ws");
                if (err) {
                    console.log("Error: ", err)
                    return callback("error getting number of rows", []);
                }
                var i = 1;
                ws.eachRow(function (err, row, meta) {
//                    console.log("in row: " + meta.index);
                    if (err) {
                        console.log("Error: ", err)
                        return callback("error getting number of rows", []);
                    }
                    if (meta.index === docId) {
//                        console.log("in if");
                        content = row
                        if(content.lastupdated){
                           last_modified = new Date(content.lastupdated)
                        }
//                        console.log("in before callback: " + JSON.stringify(content));
                        return getPathData();
                    }
                    i++;
                })

            })
        }
    },

    getContentPaths: function (basePath, callback) {
        var self = this;
        if (!basePath) {
            return callback("base path can't be null", []);
        }
        _spreadsheet.worksheet(1, function (err, ws) {
            if (err) {
                console.log("Error: ", err)
                return callback("error getting number of rows", []);
            }
            var collected_contents = [];
            var i = 1;
            self._row_data = []
            self._paths = []
            ws.eachRow(function (err, row, meta) {
                if (err) {
                    console.log("Error: ", err)

                    return callback("error getting number of rows", []);
                }
//               console.log("Row:" + JSON.stringify(row))
//               console.log("Meta:" + JSON.stringify(meta))
                self._row_data.push(row);
                var path = "/" + i.toString()
                self._paths.push({"title": row.title, "path": path});
                collected_contents.push("/" + i.toString());
                i++;
                if (meta.index === meta.total) {
                    collected_contents.push("/index");
//                    console.log("getting rows")
//                    console.log("data: " + JSON.stringify(ws));
//                    console.log("Found content " + collected_contents.length + " paths");
//                    console.log("Found content " + JSON.stringify(collected_contents));
                    return callback(null, collected_contents);
                }
            })


        })


    },

    isSection: function (request_path) {
        return false;
    },

    getSections: function (callback) {
        var self = this;
        return default_content_handler.getSections(callback);
    }

};