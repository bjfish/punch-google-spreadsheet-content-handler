Punch Google Spreadsheet Content Handler
========================================

# Description

An POC to Generate A Static Site from Google Spreadsheet using Punch

# Details

This **experimental** code works to generate a page per row of data in a Google Spreadsheet (Note Including a Header Row). The rows are 1 based indexed and are user to generate the paths. Example:

	[/1,/2,/3] // 3 paths for 3 rows

It uses the first worksheet only in a Google Spreadsheet. The data is then available in each page and accessible using the header row as a key.

If a "Last Updated" column is added with an ISO-8601 date this will be used to determine if a row has been modified. There are many answers on StackOverflow as how to update this column when a row changes.

A variable called `paths` is available in the content model which contains all paths which can be used to create an index page.

# Requirements
* [Punch](http://laktek.github.io/punch/)
* Google Spreadsheet Published to the Web as Public

# Configuration
The content handler needs to be configured in the plugins section along with the spreadsheet key in your `config.json`.

	,"plugins": {
		"content_handler": "punch-google-spreadsheet-content-handler"
    },
    "google_spreadsheet": {
        "spreadsheet_key":"YOUR KEY HERE"
     }

# Spreadsheet Key
The spreadsheet key is found in the URL of an open spreadsheet 


