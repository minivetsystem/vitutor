
require('dotenv').config()
var app = require('express')();
const cors = require("cors");
const ejs = require("ejs");
//to enable cors
app.use(cors());
/*
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});*/
var express = require('express');
const path = require('path');
app.use( express.static( "public" ) );
//set express view engine
app.set("view engine", "ejs");
var http = require('http').createServer(app).listen(3444);
var io = require('socket.io').listen(http);
const mysql = require('mysql');
const AWS = require('aws-sdk');
const fs = require('fs');
var moment = require('moment');
var SqlString = require('sqlstring');
const sendGridMail = require('@sendgrid/mail');
sendGridMail.setApiKey('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');
require('events').EventEmitter.prototype._maxListeners = Infinity;



//var FileReader = require('filereader'), fileReader = new FileReader();

// var db = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     timezone: 'utc',
//     charset : 'utf8mb4'
// });
var db = mysql.createPool({
    host: process.env.DB_HOST,
    // user: "vitutorsappdb",
    user: "root",
    //  password: "KKB@1c#@fx#2h2",
    password: "Office@123",
    database: "vitutorsappdb",
    // database: "vitutorsdb",
    timezone: 'utc',
    charset : 'utf8mb4'
});

//routes which handles the requests
app.get("/hello", function(req, res, next){
    let emailTemplate;
    let receiver_first_name = "";
    let sender_name = "";
    let message_board_link = "";
    ejs.renderFile(path.join(__dirname, "email_template/new_message.ejs"),
    {
        receiver_first_name: 'Shweta',
        sender_name: 'Shweta Mishra',
        message_board_link: "http://www.8link.in/confirm=shweta12@yopmail.com"
    }).then(function(result){
        emailTemplate = result;
        res.send(emailTemplate);
    }).catch(function(err){
        res.status(400).json({
            message: "Error Rendering emailTemplate",
            error: err
        });
    });
});

function getMessage(receiverName, senderName, messageBoardLink, receiver_email) {
        let emailTemplate;
        let receiver_first_name = "";
        let sender_name = "";
        let message_board_link = "";
        ejs.renderFile(path.join(__dirname, "email_template/new_message.ejs"),
        {
            receiver_first_name: receiverName,
            sender_name: senderName,
            message_board_link: messageBoardLink
        }).then(async function(result) {
            emailTemplate = result;
            const message_content = {
                to: receiver_email,
                from: 'vitutors@yahoo.com',
                subject: 'New Message Received',
                html: emailTemplate,
            };
            await sendGridMail.send(message_content);
        }).catch(function(err){
        });
}

var Redis = require('ioredis');
var redis = new Redis();

// The name of the bucket that you have created
const BUCKET_NAME = "vitutors-dev";
//Now, we need to initialize the S3 interface by passing our access keys:
const s3 = new AWS.S3({
    accessKeyId: "AKIATPPRDBSRIDQFM5PW",
    secretAccessKey: "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"
});
/*db.connect(function(err){
    if (err) console.log(err)
})*/
console.log("hello world")

const connnections = [];
var files = {}, 
            struct = { 
                name: null, 
                type: null, 
                size: 0, 
                data: [], 
                slice: 0,
            };

var clients = 0;
io.on('connection', function(client){
    clients++;
    client.on("is_connection", function(){
        io.to(client.id).emit('is_connection', {'data' : {'connection_id' : client.id , 'status' : true}});
    });
    client.on('send_message', function(chat_data){
        try{
            var data= chat_data;
            var message = chat_data.message;
            var sender_id = chat_data.sender_id;
            var receiver_id = chat_data.receiver_id;
            var message_board_room_id = chat_data.message_board_room_id;
            var job_id = chat_data.job_id;
            var receiverName = '';
            var senderName = '';
            var message_board_url = '';
            var receiver_email = '';
            db.query("SELECT * from user_profiles where user_id = "+sender_id, function(sender_err, sender_detail){
               if(!sender_err){
                   senderName = sender_detail[0].first_name + ' '+ sender_detail[0].last_name;
               }
            });
            db.query("INSERT INTO message_boards (message, message_board_room_id,receiver_id, sender_id, job_id,created_at,updated_at)  VALUES ("+SqlString.escape(message)+",'"+ message_board_room_id +"','"+receiver_id+"','"+sender_id+"','"+job_id+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insertError) {
                if (!insertError) {
                    db.query("SELECT * from user_profiles INNER JOIN users ON users.id = user_profiles.user_id where user_profiles.user_id = '" + receiver_id + "'", async function (err, senderrow) {
                        receiverName = senderrow[0].first_name + ' '+ senderrow[0].last_name;
                        if(senderrow[0].role_id == 3){
                            message_board_url = 'https://app.vitutors.com/tutor/message-board' ;
                        }else{
                            message_board_url = 'https://app.vitutors.com/student/message-board' ;
                        }
                        receiver_email = senderrow[0].email;
                        result_data = {
                            'status_code': 200,
                            'message': 'Chat message has been sent Successfully',
                            'data': {"message":message ,"sender_id": sender_id,"receiver_id": receiver_id,"sender":senderName,"receiver":receiverName,"created_at":  moment.utc().format("YYYY-MM-DD HH:mm:ss")}
                        };
                        io.sockets.emit('response_chat_'+chat_data.user_id+'_messages', result_data);

                        db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('You have received a new message from "+senderName+"', "+SqlString.escape(message)+",'new_message', '"+receiver_id+"', '"+message_board_room_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
                            if(!notificationError){
                                var notification_result = {
                                    'id' : notificationSuccess.insertId,
                                    'notification' : 'You have received a new message from '+senderName,
                                    'notification_message' : SqlString.escape(message),
                                    'type' : 'new_message',
                                    'user_id' : receiver_id,
                                    'reference_id' : message_board_room_id,
                                    'status' : 0,
                                    'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                                    'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                                };
                                io.sockets.emit('new_notification_'+receiver_id, notification_result);
                            }else{
                            }
                        });
                        await getMessage(receiverName , senderName, message_board_url, receiver_email);
                    });
                }
                else{
                }
            });
        } catch (error) {
            io.sockets.emit('response_chat_messages_error', error);
        }    
    });
    
    client.on('image_upload', function(chat_data){
        try{
            var data= chat_data;
            var message = chat_data.message;
            var sender_id = chat_data.sender_id;
            var receiver_id = chat_data.receiver_id;
            var message_board_room_id = chat_data.message_board_room_id;
            var job_id = chat_data.job_id;
            var file_name = chat_data.name;
            var file_size = chat_data.size;
            var file_type = chat_data.type;

            if(file_name && file_name!='')
            {
                if (!files[data.name]) 
                    { 
                        files[data.name] = Object.assign({}, struct, data); 
                        files[data.name].data = []; 
                    }
                    data.data = new Buffer.from(new Uint8Array(data.data)); 
                    files[data.name].data.push(data.data); 
                    files[data.name].slice++;
                 
                if (files[data.name].slice * 100000 >= files[data.name].size)
                { 
                    const fileContents = Buffer.concat(files[data.name].data); 

                    db.query("INSERT INTO message_boards (message, message_board_room_id,receiver_id, sender_id, job_id,created_at,updated_at)  VALUES ("+SqlString.escape(message)+",'"+ message_board_room_id +"','"+receiver_id+"','"+sender_id+"','"+job_id+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insertError, insetMessageResult) 
                    {
                        if (!insertError) 
                        {
                            db.query("SELECT s3_path, first_name, last_name FROM user_profiles WHERE user_id =" + sender_id, function(s3Error, senderResult) 
                            {
                                if (!s3Error) 
                                {
                                    var split = data.name.split('.');	// split filename by .(extension)
                                    var upload_file_name = `${split[0]}_${new Date().getTime()}.${split[1]}`;
                                    const params = {
                                        Bucket: BUCKET_NAME, // pass your bucket name
                                        Key: senderResult[0].s3_path + upload_file_name, // file will be saved in <folderName> folder
                                        Body: fileContents,
                                        ContentType: file_type,
                                        ACL:'public-read'
                                    };
                                    s3.upload(params, function (s3UpdateError, updateData) 
                                    {
                                       if (!s3UpdateError) {
                                            file_url = updateData.Location;
                                            db.query("INSERT INTO message_board_attachments (message_id,filename,file_url, file_size, file_type, created_at,updated_at) VALUES ("+insetMessageResult.insertId+",'"+upload_file_name+"','"+updateData.Location+"','"+file_size+"','"+file_type+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insert_error, insert_result) {
                                                if (!insert_error){
                                                    delete files[data.name];
                                                } 
                                                else{
                                                    return client.emit('upload error'); 
                                                }
                                            
                                                result_data = {
                                                    'status_code': 200,
                                                    'message': 'Image Uploaded Successfully',
                                                };

                                                client.emit('end_'+chat_data.user_id+'_upload',result_data);

                                                db.query("SELECT * from user_profiles WHERE user_id = "+sender_id, function(senderErr, senderSucc){
                                                    if(!senderErr){
                                                        var senderName = senderSucc[0].first_name +' '+ senderSucc[0].last_name;
                                                        db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('You have received a new message from "+senderName+"', 'File' ,'new_message', '"+receiver_id+"', '"+message_board_room_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
                                                            if(!notificationError){
                                                                var notification_result = {
                                                                    'id' : notificationSuccess.insertId,
                                                                    'notification' : 'You have received a new message from '+senderName,
                                                                    'notification_message' : SqlString.escape(message),
                                                                    'type' : 'new_message',
                                                                    'user_id' : receiver_id,
                                                                    'reference_id' : message_board_room_id,
                                                                    'status' : 0,
                                                                    'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                                                                    'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                                                                };
                                                                io.sockets.emit('new_notification_'+receiver_id, notification_result);
                                                            }else{
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                        else{
                                        }
                                    }); // s3upload
                                } //s3error
                                else{
                                }
                            });
                        } //insert error 
                        else{
                        }
                    });
                } 
            else {
                client.emit('request_slice_'+chat_data.user_id+'_upload', { currentSlice: files[data.name].slice  }); 
                } 
            } // not filename
        } 
        catch (error) {
            io.sockets.emit('response_chat_messages_error', error);
        }    
    });

    //message read event
    client.on('message_read', async (data) => {
        // user id
        var update = "UPDATE message_boards SET is_read = 1 WHERE  message_board_room_id =" + data.message_board_room_id;
        db.query(update, function (err, result) {
            if (!err){
                io.sockets.emit('chat_read_'+data.user_id, {"data": result.affectedRows+" record(s) updated"});
            } else{
            }
        });
    });

    client.on('typing', data => {
        io.sockets.emit('typing', {username: data.full_name})
    })

    client.on('tutor_contact_list', data => {
       var query= "SELECT t1.id, t1.sender_id, t1.is_read, t1.receiver_id, t1.message_board_room_id, t1.message,t1.created_at, t1.job_id, jobs.job_title, jobs.proposed_start_time, jobs.duration, jobs.job_slug, jobs.job_description, jobs.job_type, jobs.price_type, jobs.price , job_recurring.recurring_type , CONCAT('$' , jobs.price) as price ,CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name,sender_profile.country as sender_country ,CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name,receiver_profile.country as receiver_country,IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image,IF(receiver_profile.photo = '',NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, IF(sender.role_id = 3 , 'Tutor', 'Student') as sender_role,IF(receiver.role_id = 3 , 'Tutor', 'Student') as receiver_role , CASE job_offers.status WHEN 1 THEN 'Accepted' WHEN 2 THEN 'Rejected' WHEN 0 THEN 'PENDING' WHEN 5 THEN 'Terminated' ELSE NULL end offer_status FROM message_boards AS t1 inner join `jobs` on `jobs`.`id` = t1.`job_id` left join `job_recurring` on `job_recurring`.`job_id` = t1.`job_id` inner join user_profiles as sender_profile on `sender_profile`.`user_id` = t1.`sender_id` inner join user_profiles as receiver_profile on `receiver_profile`.`user_id` = t1.`receiver_id` inner join users as sender on `sender`.id = t1.sender_id left join job_offers on job_offers.job_id =t1.job_id inner join users as receiver on `receiver`.id = t1.receiver_id INNER JOIN(SELECT LEAST(sender_id, receiver_id) AS sender_id, GREATEST(sender_id, receiver_id) AS receiver_id, MAX(id) AS max_id FROM message_boards GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), job_id) AS t2 ON LEAST(t1.sender_id, t1.receiver_id) = t2.sender_id AND GREATEST(t1.sender_id, t1.receiver_id) = t2.receiver_id AND t1.id = t2.max_id WHERE t1.sender_id = '" + data.user_id + "' OR t1.receiver_id = '" + data.user_id + "'";
       db.query(query, function (err, result, fields) {
        if(!err){
            var total_length = result.length, c = 0;
            
            result.forEach(function(result_object) {
                result_object.student_id = data.user_id;
                if(result_object.sender_id != data.user_id ) {
                    result_object.ref_id = result_object.sender_id;
                    result_object.tutor_name= result_object.sender_name;
                    result_object.tutor_profile_image= result_object.sender_image;
                    db.query("SELECT a.hourly_rate, a.experince_level ,a.avg_rating, a.about_me, a.profile_slug, b.name as country_name from user_profiles As a LEFT JOIN countries As b ON a.country = b.id where a.user_id = "+result_object.sender_id+"",async function(detail_err , detail_res){
                        // c++;
                        if(!detail_err){
                            if(detail_res.length > 0){
                               
                                result_object['hourly_rate'] = detail_res[0].hourly_rate;
                                result_object['experience_level'] = detail_res[0].experince_level;
                                result_object['about_me'] = detail_res[0].about_me;
                                result_object['profile_slug'] = detail_res[0].profile_slug;
                                result_object['country'] = detail_res[0].country_name;
                                result_object['rating'] = detail_res[0].avg_rating.toString();
                                // result_object['rating1'] = result_object['rating'].toString();
                                result_object['rating_count'] = 0;
                                await db.query("SELECT COUNT(*) As rating_count FROM session_reviews where tutor_id = "+result_object.sender_id+"", function(count_err , count_res){
                                    c++;
                                    result_object['rating_count'] = count_res[0] && count_res[0].rating_count?count_res[0].rating_count:0;
                                    if(c === total_length){
                                        result_data = {
                                            'status_code': 200,
                                            'message': 'Data Retrieve Successfully',
                                            'data': result
                                        };
                                   
        
                                        io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                                    }
                                });
                                
                            }else {
                                c++;
                                if(c === total_length){
                                    result_data = {
                                        'status_code': 200,
                                        'message': 'Data Retrieve Successfully',
                                        'data': result
                                    };
    
                                    io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                                }
                            }                            
                            
                        }
                        else{
                            result_data = {
                                'status_code': 200,
                                'message': 'Data Retrieve Successfully',
                                'data': []
                            };
                            io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                        }
                    });
                }
                if(result_object.receiver_id != data.user_id ) {
                    result_object.ref_id= result_object.receiver_id;
                    result_object.tutor_name= result_object.receiver_name;
                    result_object.tutor_profile_image= result_object.receiver_image;
                    db.query("SELECT a.hourly_rate, a.experince_level,a.avg_rating , a.about_me, a.profile_slug, b.name as country_name from user_profiles As a LEFT JOIN countries As b ON a.country = b.id where a.user_id = "+result_object.receiver_id+"", async function(detail_err , detail_res){
                        // c++;
                        if(!detail_err){
                            if(detail_res.length > 0){
                                result_object['hourly_rate'] = detail_res[0].hourly_rate;
                                result_object['experience_level'] = detail_res[0].experince_level;
                                result_object['about_me'] = detail_res[0].about_me;
                                result_object['profile_slug'] = detail_res[0].profile_slug;
                                result_object['country'] = detail_res[0].country_name;
                                result_object['rating'] = detail_res[0].avg_rating.toString();
                                // result_object['rating1'] = result_object['rating'].toString();
                                result_object['rating_count'] = 0;
                                await db.query("SELECT COUNT(*) As rating_count FROM session_reviews where tutor_id = "+result_object.receiver_id+"", function(count_err , count_res){
                                   c++;
                                   // if(!count_err){
                                    //     rating_count_ = count_res[0].rating_count;
                                    // }
                                    result_object['rating_count'] = count_res[0] && count_res[0].rating_count?count_res[0].rating_count:0;
                                    if(c === total_length){
                                        result_data = {
                                            'status_code': 200,
                                            'message': 'Data Retrieve Successfully',
                                            'data': result
                                        };
                                        io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                                    }

                                });
                                
                                
                            }else {
                                c++
                                if(c === total_length){
                                    result_data = {
                                        'status_code': 200,
                                        'message': 'Data Retrieve Successfully',
                                        'data': result
                                    };
                                    io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                                }
                            }
                            
                        }
                        else{
                            result_data = {
                                'status_code': 200,
                                'message': 'Data Retrieve Successfully',
                                'data': []
                            };
                            io.sockets.emit('tutors_'+data.user_id+'_list', result_data);
                        }
                    });
                }
            });
        }else{
        }
      });
    });

    client.on('student_contact_list', data => {
        var query= "SELECT t1.id, t1.is_read, t1.sender_id, t1.receiver_id, t1.message_board_room_id, t1.message,t1.created_at, t1.job_id, jobs.job_title, jobs.job_slug, jobs.job_description, jobs.job_type, jobs.price_type, jobs.price ,CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name, CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name,IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image,IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image,IF(sender.role_id = 3 , 'Tutor', 'Student') as sender_role,IF(receiver.role_id = 3 , 'Tutor', 'Student') as receiver_role, CASE job_offers.status WHEN 1 THEN 'Accepted' WHEN 2 THEN 'Rejected' WHEN 0 THEN 'PENDING' WHEN 5 THEN 'Terminated' ELSE NULL end offer_status FROM message_boards AS t1 inner join `jobs` on `jobs`.`id` = t1.`job_id` inner join user_profiles as sender_profile on `sender_profile`.`user_id` = t1.`sender_id` inner join user_profiles as receiver_profile on `receiver_profile`.`user_id` = t1.`receiver_id` inner join users as sender on `sender`.id = t1.sender_id left join job_offers on job_offers.job_id =t1.job_id inner join users as receiver on `receiver`.id = t1.receiver_id INNER JOIN(SELECT LEAST(sender_id, receiver_id) AS sender_id, GREATEST(sender_id, receiver_id) AS receiver_id, MAX(id) AS max_id FROM message_boards GROUP BY LEAST(sender_id, receiver_id), GREATEST(sender_id, receiver_id), job_id) AS t2 ON LEAST(t1.sender_id, t1.receiver_id) = t2.sender_id AND GREATEST(t1.sender_id, t1.receiver_id) = t2.receiver_id AND t1.id = t2.max_id WHERE t1.sender_id = '" + data.user_id + "' OR t1.receiver_id = '" + data.user_id + "'";
        db.query(query, function (err, result, fields) {
         if(!err){
             var total_length = result.length, c = 0;
             result.forEach(function(result_object) {
                 result_object.tutor_id = data.user_id;
                 if(result_object.sender_id != data.user_id ) {
                     result_object.ref_id = result_object.sender_id;
                     result_object.tutor_name= result_object.sender_name;
                     result_object.tutor_profile_image= result_object.sender_image;
                     db.query("SELECT hourly_rate, experince_level , about_me, profile_slug, countries.name as country_name from user_profiles LEFT JOIN countries ON user_profiles.country = countries.id where user_profiles.user_id = "+result_object.sender_id, function(detail_err , detail_res){
                         c++;
                         if(!detail_err){
                             result_object.hourly_rate = detail_res[0].hourly_rate;
                             result_object.experience_level = detail_res[0].experince_level;
                             result_object.about_me = detail_res[0].about_me;
                             result_object.profile_slug = detail_res[0].profile_slug;
                             result_object.country = detail_res[0].country_name;
                         }
                         if(c === total_length) {
                            result_data = {
                                'status_code': 200,
                                'message': 'Data Retrieve Successfully',
                                'data': result
                            };
                            io.sockets.emit('students_'+data.user_id+'_list', result_data);
                        }
                     });

                     
                 }
                 if(result_object.receiver_id != data.user_id ) {
                     result_object.ref_id= result_object.receiver_id;
                     result_object.tutor_name= result_object.receiver_name;
                     result_object.tutor_profile_image= result_object.receiver_image;
                     db.query("SELECT hourly_rate, experince_level , about_me,profile_slug, countries.name as country_name from user_profiles LEFT JOIN countries ON user_profiles.country = countries.id  where user_profiles.user_id = "+result_object.receiver_id, function(detail_err , detail_res){
                         c++;
                         if(!detail_err){
                             result_object.hourly_rate = detail_res[0].hourly_rate;
                             result_object.experience_level = detail_res[0].experince_level;
                             result_object.about_me = detail_res[0].about_me;
                             result_object.profile_slug = detail_res[0].profile_slug;
                             result_object.country = detail_res[0].country_name;

                         }
                         if(c === total_length) {
                             result_data = {
                                 'status_code': 200,
                                 'message': 'Data Retrieve Successfully',
                                 'data': result
                             };
                             io.sockets.emit('students_'+data.user_id+'_list', result_data);
                         }
                     });
                 }
             });

         }else{
         }
       });
     });


     client.on('jobs_list', data => {
        var query = "select `jobs`.`id` as `job_id`, `jobs`.`job_title` from `message_board_rooms` inner join `users` on `users`.`id` = `message_board_rooms`.`student_id` inner join `user_profiles` on `user_profiles`.`user_id` = `message_board_rooms`.`student_id` inner join `jobs` on `jobs`.`id` = `message_board_rooms`.`job_id` where `tutor_id` = '" + data.user_id + "'";
        
        db.query(query, function (err, result, fields) {
         if (!err) {
             result_data = {
                 'status_code': 200,
                 'message': 'Data Retrieve Successfully',
                 'data': result
             };
             io.sockets.emit('jobs_list', result_data);
         }else{
         }

       });
     });
   
     client.on('send_invite', data => {
        var query = "select `jobs`.`id` as `job_id`, `jobs`.`job_title` from `message_board_rooms` inner join `users` on `users`.`id` = `message_board_rooms`.`student_id` inner join `user_profiles` on `user_profiles`.`user_id` = `message_board_rooms`.`student_id` inner join `jobs` on `jobs`.`id` = `message_board_rooms`.`job_id` where `tutor_id` = '" + data.user_id + "'";
        
        db.query(query, function (err, result, fields) {
         if (!err){
             result_data = {
                 'status_code': 200,
                 'message': 'Data Retrieve Successfully',
                 'data': result
             };
             io.sockets.emit('send_invite', result_data);
         }else{
         }

       });
     });
   
     client.on('apply_job', data => {
        var query = "select `jobs`.`id` as `job_id`, `jobs`.`job_title` from `message_board_rooms` inner join `users` on `users`.`id` = `message_board_rooms`.`student_id` inner join `user_profiles` on `user_profiles`.`user_id` = `message_board_rooms`.`student_id` inner join `jobs` on `jobs`.`id` = `message_board_rooms`.`job_id` where `tutor_id` = '" + data.user_id + "'";
        db.query(query, function (err, result, fields) {    
         if (!err){
             result_data = {
                 'status_code': 200,
                 'message': 'Data Retrieve Successfully',
                 'data': result
             };
             io.sockets.emit('apply_job', result_data);
         }else{
         }
       });
     });
   
    client.on('get_messages', data => {
        var query = "select message_boards.id as message_id,message_boards.is_offer_sent,message_boards.is_session_updated, message_boards.json_response, message_boards.is_application_cancel as is_application_cancel,`message_boards`.message_board_room_id, jobs.id as job_id,IF(senderuserdata.role_id = 3 , 'Tutor', 'Student') as sender_role,IF(receiveruserdata.role_id = 3 , 'Tutor', 'Student') as receiver_role,receiveruserdata.timezone AS timezone,CONCAT(`u`.`first_name`,' ', `u`.`last_name`) as sender_name, message_board_attachments.file_url,message_board_attachments.filename, message_board_attachments.file_type, message_boards.created_at as message_sent_time, CONCAT(u1.first_name,' ',u1.last_name) as receiver_name ,`message_boards`.`message` , IF(u1.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',u1.s3_path,'profile-picture/',u1.photo)) as receiver_image, IF(u.photo IS NULL or u.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',u.s3_path,'profile-picture/',u.photo)) as sender_image,u.user_id as sender_user_id,u1.user_id as receiver_user_id,jobs.job_title, jobs.job_slug, jobs.price_type, tu.accepted_price AS updated_accepted_price,tu.schedule_date AS updated_schedule_date,tu.time AS tutor_updated_time,IF(tu.start_date IS NULL OR tu.start_date = '0000-00-00',NULL,tu.start_date) AS updated_start_date,IF(tu.end_date IS NULL OR tu.end_date = '0000-00-00',NULL,tu.end_date) AS updated_end_date,tu.time AS updated_time,tu.date As updated_date,tu.day AS updated_day,tu.id AS updated_offer_id, tu.image_title AS updated_file_name,tu.file_type AS updated_file_type,CASE WHEN tu.status = '0' THEN 'Pending' WHEN tu.status = '1' THEN 'Accepted' WHEN tu.status = '2' THEN 'Declined' WHEN tu.status = '3' THEN 'Expired' END AS updated_status,    IF(tu.attachment IS NULL OR tu.attachment = '',NULL, CONCAT( 'https://vitutors-dev.s3-us-west-1.amazonaws.com/',u.s3_path,'',tu.attachment) ) AS updated_attachment from `message_boards` inner join `message_board_rooms` on `message_board_rooms`.`id` = `message_boards`.`message_board_room_id` inner JOIN jobs on jobs.id = message_boards.job_id inner JOIN user_profiles on user_profiles.user_id = message_boards.sender_id inner JOIN users as senderuserdata on senderuserdata.id = message_boards.sender_id inner JOIN users as receiveruserdata on receiveruserdata.id = message_boards.receiver_id inner JOIN user_profiles u1 on u1.user_id = message_boards.receiver_id inner JOIN user_profiles u on u.user_id = message_boards.sender_id LEFT JOIN tutor_updated_offers tu ON tu.message_board_id = message_boards.id  left JOIN message_board_attachments on message_board_attachments.message_id = message_boards.id where message_board_room_id = '"+data.message_board_room_id+"' ";
     
        db.query(query, function (err, result) {
            console.log("res", result);
            if (!err) {
                // getjoboffer = "Select job_offers.accepted_price,job_offers.attachment,file_size, file_type, jobs.job_title, CASE job_offers.status WHEN 1 THEN 'Accepted' WHEN 2 THEN 'Rejected' ELSE 'Pending' end offer_status,job_offers.message from job_offers inner join jobs on jobs.id = job_offers.job_id where jobs.id = '"+data.job_id+"' ";
                getjoboffer = "SELECT job_offers.id AS offer_id,user_profiles.s3_path,job_offers.accepted_price,job_offers.attachment AS attachment_name,job_offers.file_size,job_offers.file_type,jobs.job_title,jobs.job_type,jobs.price_type, IF(job_offers.attachment IS NULL OR job_offers.attachment = '',NULL,CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',job_offers.s3_path,'/',job_offers.attachment)) AS attachment_link,job_offers.image_title,CASE job_offers.status WHEN 1 THEN 'Accepted' WHEN 2 THEN 'Rejected' WHEN 5 THEN 'Terminated' ELSE 'Pending' END offer_status,job_offers.message,job_sessions.start_date as scheduled_date,job_sessions.start_time as scheduled_time,job_recurring.start_date,job_recurring.end_date,job_recurring.date,job_recurring.day,job_recurring.time,job_recurring.recurring_type FROM job_offers INNER JOIN jobs ON jobs.id = job_offers.job_id INNER JOIN user_profiles ON user_profiles.user_id = job_offers.student_id INNER JOIN (select job_id, min(date) as start_date,max(date) as end_date,start_time from job_sessions where job_id = '"+data.job_id+"' group by job_id, start_time) job_sessions ON jobs.id = job_sessions.job_id LEFT JOIN job_recurring ON jobs.id = job_recurring.job_id WHERE job_offers.job_id = '"+data.job_id+"' AND job_offers.student_id = '"+data.student_id+"' AND job_offers.tutor_id = '"+data.tutor_id+"'";
                db.query(getjoboffer, function (err, job_result) {
                   if(job_result){
             
                    //    get length of job_result
                      result_data = {
                               'status_code': 200,
                               'message': 'Data Retrieve Successfully!',
                               'data': result,
                               'job_offer_details' : job_result
                           };
                      io.emit('messages_'+data.user_id+'_list', result_data);
                   }else{
                     
                   }
                });
                

            } else {
            }
        });
    });

    client.on('disconnect', function(){
    });

    client.on('admin_contacts', function(data){
        var query = "SELECT t1.id, t1.sender_id, t1.is_read, t1.message_board_room_id, t1.message, t1.created_at, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name , CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image, IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, IF(receiver.role_id = 4 , 'Tutor', 'Admin') as receiver_role ,IF(sender.role_id = 4 , 'Tutor', 'Admin') as sender_role, attachment.file_name, attachment.file_type, attachment.file_url FROM admin_message_boards t1 JOIN (SELECT message_board_room_id, MAX(created_at) created_at FROM admin_message_boards GROUP BY message_board_room_id) t2 ON t1.message_board_room_id = t2.message_board_room_id AND t1.created_at = t2.created_at INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS attachment ON attachment.admin_message_board_id = t1.id WHERE (sender.role_id = 1 OR sender.role_id = "+data.user_role_id+") AND (receiver.role_id = 1 OR receiver.role_id = "+data.user_role_id+") AND (t1.sender_id = "+data.user_id+" OR t1.receiver_id = "+data.user_id+")";
        db.query(query, function(err, result){
          
            if(!err){
                result_data = {
                    'status_code': 200,
                    'message': 'Data Retrieve Successfully',
                    'data': result
                };
                console.log("res1", result_data);
                io.sockets.emit('admin_contact_list_'+data.user_id, result_data);
            }else{
            }
        });
    });

    client.on('send_admin_messages', function(chat_data){
        try{
            var message = chat_data.message;
            var sender_id = chat_data.sender_id;
            var receiver_id = chat_data.receiver_id;
            var message_board_room_id = chat_data.message_board_room_id;
            var sender_name = '';
            var receiver_name = '';
            var message_board_url = '';
            var receiver_email = '';
            if(sender_id == 1){
                sender_name = 'Vitutors Admin';
            }else{
                db.query("SELECT * from user_profiles where user_id = "+sender_id, function(sender_err, sender_detail){
                    if(!sender_err){
                        sender_name = sender_detail[0].first_name + ' '+ sender_detail[0].last_name;
                    }
                });
            }

            db.query("INSERT INTO admin_message_boards (message_board_room_id,message,  sender_id, receiver_id, is_read, created_at,updated_at)  VALUES ('"+ message_board_room_id+"',"+ SqlString.escape(message) +",'"+sender_id+"','"+receiver_id+"', 0 ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insertError) {
                if (!insertError) {
                    db.query("SELECT * from user_profiles INNER JOIN users ON users.id = user_profiles.user_id where user_profiles.user_id = " + receiver_id , async function (err, senderrow) {
                        if(!err){
                            receiver_name = senderrow[0].first_name + ' '+ senderrow[0].last_name;
                            receiver_email = senderrow[0].email;
                            if(senderrow[0].role_id == 1){
                                message_board_url = 'https://admin.vitutors.com/admin/message-board';
                            }else if(senderrow[0].role_id == 3){
                                message_board_url = 'https://app.vitutors.com/tutor/message-board';
                            }else{
                                message_board_url = 'https://app.vitutors.com/student/message-board';
                            }
                            await getMessage(receiver_name , sender_name, message_board_url, receiver_email);
                        }else{
                        }
                    });
                    result_data = {
                        'status_code': 200,
                        'message': 'Chat message has been sent Successfully',
                        'data': {"message":message ,"sender_id": sender_id,"receiver_id": receiver_id,"sender":sender_name,"receiver":receiver_name,"created_at":  moment.utc().format("YYYY-MM-DD HH:mm:ss")}
                    };
                    console.log("res2",result_data);
                    io.sockets.emit('response_chat_'+receiver_id+'_'+message_board_room_id+'_messages', result_data);

                    db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('You have received a new message from "+sender_name+"', "+SqlString.escape(message)+" ,'admin_new_message', '"+receiver_id+"', '"+message_board_room_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
                        if(!notificationError){
                            var notification_result = {
                                'id' : notificationSuccess.insertId,
                                'notification' : 'You have received a new message from '+sender_name,
                                'notification_message' : SqlString.escape(message),
                                'type' : 'admin_new_message',
                                'user_id' : receiver_id,
                                'reference_id' : message_board_room_id,
                                'status' : 0,
                                'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                                'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                            };
                            io.sockets.emit('new_notification_'+receiver_id, notification_result);
                        }else{
                        }
                    });
                    var message_query = "SELECT t1.id, t1.sender_id, t1.is_read, t1.message_board_room_id, t1.message, t1.created_at, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name , CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image, IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, IF(receiver.role_id = 4 , 'Tutor', 'Admin') as receiver_role ,IF(sender.role_id = 4 , 'Tutor', 'Admin') as sender_role, attachment.file_name, attachment.file_type, attachment.file_url FROM admin_message_boards t1 JOIN (SELECT message_board_room_id, MAX(created_at) created_at FROM admin_message_boards GROUP BY message_board_room_id) t2 ON t1.message_board_room_id = t2.message_board_room_id AND t1.created_at = t2.created_at INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS attachment ON attachment.admin_message_board_id = t1.id WHERE (sender.role_id = 1 OR sender.role_id = "+chat_data.role_id+") AND (receiver.role_id = 1 OR receiver.role_id = "+chat_data.role_id+") AND (t1.sender_id = "+receiver_id+" OR t1.receiver_id = "+receiver_id+")";
                    db.query(message_query, function(err, result){
                        if(!err){
                            result_data = {
                                'status_code': 200,
                                'message': 'Data Retrieve Successfully',
                                'data': result
                            };
                            io.sockets.emit('admin_contact_list_'+receiver_id, result_data);
                        }else{
                        }
                    });
                }
                else{
                }
            });
        } catch (error) {
            io.sockets.emit('response_chat_messages_error', error);
        }
    });

    client.on('student_contacts', function(){
        var query= "SELECT t1.id, t1.sender_id, t1.receiver_id, t1.is_read, t1.message_board_room_id, t1.message, t1.created_at, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name , CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image, IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, receiver.role_id As receiver_role_id, sender.role_id As sender_role_id, IF(receiver.role_id = 4 , 'Student', 'Admin') as receiver_role ,IF(sender.role_id = 4 , 'Student', 'Admin') as sender_role, IF(sender.role_id = 4, CONCAT(sender_profile.first_name,' ', sender_profile.last_name), CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name)) as message_via, attachment.file_name, attachment.file_type, attachment.file_url FROM admin_message_boards t1 JOIN (SELECT message_board_room_id, MAX(created_at) created_at FROM admin_message_boards GROUP BY message_board_room_id ORDER BY created_at DESC) t2 ON t1.message_board_room_id = t2.message_board_room_id AND t1.created_at = t2.created_at INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS attachment ON attachment.admin_message_board_id = t1.id WHERE (sender.role_id = 1 AND receiver.role_id = 4) OR (receiver.role_id = 1 AND sender.role_id = 4) order By t1.created_at DESC";
        db.query(query, function (err, result) {
            if(!err){
                result_data = {
                    'status_code': 200,
                    'message': 'Data Retrieve Successfully',
                    'data': result
                };
                io.sockets.emit('student_contact_list', result_data);
            }else{
            }
        });
    });

    client.on('tutor_contacts', function(){
        var query= "SELECT t1.id, t1.sender_id, t1.receiver_id, t1.is_read, t1.message_board_room_id, t1.message, t1.created_at, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name , CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image, IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, receiver.role_id As receiver_role_id, sender.role_id As sender_role_id, IF(receiver.role_id = 3 , 'Tutor', 'Admin') as receiver_role ,IF(sender.role_id = 3 , 'Tutor', 'Admin') as sender_role, IF(sender.role_id = 3 , CONCAT(sender_profile.first_name,' ', sender_profile.last_name), CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name)) as message_via,  attachment.file_name, attachment.file_type, attachment.file_url FROM admin_message_boards t1 JOIN (SELECT message_board_room_id, MAX(created_at) created_at FROM admin_message_boards GROUP BY message_board_room_id) t2 ON t1.message_board_room_id = t2.message_board_room_id AND t1.created_at = t2.created_at INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS attachment ON attachment.admin_message_board_id = t1.id WHERE (sender.role_id = 1 AND receiver.role_id = 3) OR (receiver.role_id = 1 AND sender.role_id = 3) order By t1.created_at DESC";
        db.query(query, function (err, result) {
            if(!err){
                result_data = {
                    'status_code': 200,
                    'message': 'Data Retrieve Successfully',
                    'data': result
                };
                io.sockets.emit('tutor_contact_list', result_data);
            }else{
            }
        });
    });

    client.on('chat_details', function(data){
        if(data.user_role_id == 3){
            var query = "SELECT t1.id AS message_id, t1.sender_id, t1.receiver_id, t1.created_at AS message_sent_time, t1.message, t1.message_board_room_id, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'/profile-picture/',sender_profile.photo)) as sender_image,IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name, CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender.role_id = 3 , 'Tutor', 'Admin') as sender_role, IF(receiver.role_id = 3, 'Tutor', 'Admin') as receiver_role, t2.file_type, t2.file_url, t2.file_name from admin_message_boards AS t1 INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS t2 ON t2.admin_message_board_id = t1.id WHERE t1.message_board_room_id = '"+data.message_board_room_id+"' AND (t1.sender_id = 1 OR t1.receiver_id = 1)  ORDER BY t1.id";
        }else{
            var query = "SELECT t1.id AS message_id, t1.sender_id, t1.receiver_id, t1.created_at AS message_sent_time, t1.message, t1.message_board_room_id, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image,IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name, CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender.role_id = 4 , 'Student', 'Admin') as sender_role, IF(receiver.role_id = 4, 'Student', 'Admin') as receiver_role, t2.file_type, t2.file_url, t2.file_name from admin_message_boards AS t1 INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS t2 ON t2.admin_message_board_id = t1.id WHERE t1.message_board_room_id = '"+data.message_board_room_id+"' AND (t1.sender_id = 1 OR t1.receiver_id = 1)  ORDER BY t1.id";
        }
        db.query(query, function (err, result) {
            if(!err){
                result_data = {
                    'status_code': 200,
                    'message': 'Chat Details Retrieved Successfully',
                    'data': result
                };
                io.sockets.emit('chat_details_'+data.chat_id+'_'+data.message_board_room_id, result_data);
            }else{
            }
        });
    });

    client.on('read_admin_message', async (data) => {
        // user id
        var update = "UPDATE admin_message_boards SET is_read = 1 WHERE message_board_room_id ='" + data.message_board_room_id +"'";
        db.query(update, function (err, result) {
            if (!err){
                result_data = {
                    'status_code': 200,
                    'message': 'Message Seen Successfully',
                    'data' : {'message_board_room_id' : data.message_board_room_id}
                };
                io.sockets.emit('chat_read_'+data.user_id+'_'+data.message_board_room_id, data);
            } else{
            }
        });
    });

    client.on('admin_image_upload', function(chat_data){
        try{
            var data = chat_data;
            var message = chat_data.message;
            var sender_id = chat_data.sender_id;
            var receiver_id = chat_data.receiver_id;
            var message_board_room_id = chat_data.message_board_room_id;
            var file_name = chat_data.name;
            var file_size = chat_data.size;
            var file_type = chat_data.type;

            if(file_name && file_name!='')
            {
                if (!files[data.name])
                {
                    files[data.name] = Object.assign({}, struct, data);
                    files[data.name].data = [];
                }
                data.data = new Buffer.from(new Uint8Array(data.data));
                files[data.name].data.push(data.data);
                files[data.name].slice++;

                if (files[data.name].slice * 100000 >= files[data.name].size)
                {
                    const fileContents = Buffer.concat(files[data.name].data);

                    db.query("INSERT INTO admin_message_boards ( message_board_room_id, message, receiver_id, sender_id,created_at,updated_at)  VALUES ('"+ message_board_room_id +"','','"+receiver_id+"','"+sender_id+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insertError, insetMessageResult)
                    {
                        if (!insertError)
                        {
                            db.query("SELECT s3_path, first_name, last_name FROM user_profiles WHERE user_id =" + sender_id, function(s3Error, senderResult)
                            {
                                if (!s3Error)
                                {
                                    var split = data.name.split('.');	// split filename by .(extension)
                                    var upload_file_name = `${split[0]}_${new Date().getTime()}.${split[1]}`;
                                    const params = {
                                        Bucket: BUCKET_NAME, // pass your bucket name
                                        Key: senderResult[0].s3_path + upload_file_name, // file will be saved in <folderName> folder
                                        Body: fileContents,
                                        ContentType: file_type,
                                        ACL:'public-read'
                                    };
                                    s3.upload(params, function (s3UpdateError, updateData)
                                    {
                                        if (!s3UpdateError) {
                                            file_url = updateData.Location;
                                            db.query("INSERT INTO admin_message_board_attachments (file_name,admin_message_board_id,file_url, file_size, file_type, created_at,updated_at) VALUES ('"+upload_file_name+"',"+insetMessageResult.insertId+",'"+updateData.Location+"','"+file_size+"','"+file_type+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insert_error, insert_result) {
                                                if (!insert_error){
                                                    delete files[data.name];
                                                }
                                                else{
                                                    return client.emit('upload error');
                                                }

                                                result_data = {
                                                    'status_code': 200,
                                                    'message': 'Image Uploaded Successfully',
                                                };

                                                client.emit('end_'+chat_data.user_id+'_'+chat_data.message_board_room_id+'_upload',result_data);
                                            });
                                        }
                                        else{
                                            console.log(JSON.stringify(s3UpdateError));
                                        }
                                    }); // s3upload
                                } //s3error
                                else{
                                    console.log(JSON.stringify(s3Error));
                                }
                            });
                        } //insert error
                        else{
                            console.log(JSON.stringify(insertError));
                        }
                    });
                }
                else {
                    client.emit('request_slice_'+chat_data.user_id+'_'+chat_data.message_board_room_id+'_upload', { currentSlice: files[data.name].slice  });
                }
            } // not filename
        }
        catch (error) {
            io.sockets.emit('response_chat_messages_error', error);
        }
    });

    client.on('upload_image_by_admin', function(chat_data){
        console.log(".........................................")
        console.log(chat_data);
        try{
            var data = chat_data;
            var message = chat_data.message;
            var sender_id = chat_data.sender_id;
            var receiver_id = chat_data.receiver_id;
            var receiver_role_id = chat_data.role_id;
            var message_board_room_id = chat_data.message_board_room_id;
            var file_name = chat_data.name;
            var file_size = chat_data.size;
            var file_type = chat_data.type;

            if(file_name && file_name!='')
            {
                if (!files[data.name])
                {
                    files[data.name] = Object.assign({}, struct, data);
                    files[data.name].data = [];
                }
                data.data = new Buffer.from(new Uint8Array(data.data));
                
                files[data.name].data.push(data.data);
                files[data.name].slice++;

                if (files[data.name].slice * 100000 >= files[data.name].size)
                {
                    const fileContents = Buffer.concat(files[data.name].data);

                    db.query("INSERT INTO admin_message_boards ( message_board_room_id, message, receiver_id, sender_id,created_at,updated_at)  VALUES ('"+ message_board_room_id +"','','"+receiver_id+"','"+sender_id+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insertError, insetMessageResult)
                    {
                        if (!insertError)
                        {
                            db.query("SELECT s3_path, first_name, last_name FROM user_profiles WHERE user_id =" + sender_id, function(s3Error, senderResult)
                            {
                                if (!s3Error)
                                {
                                    var split = data.name.split('.');	// split filename by .(extension)
                                    var upload_file_name = `${split[0]}_${new Date().getTime()}.${split[1]}`;
                                    const params = {
                                        Bucket: BUCKET_NAME, // pass your bucket name
                                        Key: senderResult[0].s3_path + upload_file_name, // file will be saved in <folderName> folder
                                        Body: fileContents,
                                        ContentType: file_type,
                                        ACL:'public-read'
                                    };
                                    s3.upload(params, function (s3UpdateError, updateData)
                                    {
                                        if (!s3UpdateError) {
                                            file_url = updateData.Location;
                                            db.query("INSERT INTO admin_message_board_attachments (file_name,admin_message_board_id,file_url, file_size, file_type, created_at,updated_at) VALUES ('"+upload_file_name+"',"+insetMessageResult.insertId+",'"+updateData.Location+"','"+file_size+"','"+file_type+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(insert_error, insert_result) {
                                                if (!insert_error){
                                                    delete files[data.name];
                                                }
                                                else{
                                                    return client.emit('upload error');
                                                }

                                                result_data = {
                                                    'status_code': 200,
                                                    'message': 'Image Uploaded Successfully',
                                                };

                                                client.emit('end_upload_file',result_data);

                                                var message_query = "SELECT t1.id, t1.sender_id, t1.is_read, t1.message_board_room_id, t1.message, t1.created_at, CONCAT(sender_profile.first_name,' ', sender_profile.last_name) as sender_name , CONCAT(receiver_profile.first_name,' ', receiver_profile.last_name) as receiver_name, IF(sender_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',sender_profile.s3_path,'profile-picture/',sender_profile.photo)) as sender_image, IF(receiver_profile.photo = '', NULL, CONCAT('https://vitutors-dev.s3-us-west-1.amazonaws.com/',receiver_profile.s3_path,'profile-picture/',receiver_profile.photo)) as receiver_image, IF(receiver.role_id = 4 , 'Tutor', 'Admin') as receiver_role ,IF(sender.role_id = 4 , 'Tutor', 'Admin') as sender_role, attachment.file_name, attachment.file_type, attachment.file_url FROM admin_message_boards t1 JOIN (SELECT message_board_room_id, MAX(created_at) created_at FROM admin_message_boards GROUP BY message_board_room_id) t2 ON t1.message_board_room_id = t2.message_board_room_id AND t1.created_at = t2.created_at INNER JOIN user_profiles AS sender_profile ON sender_profile.user_id = t1.sender_id INNER JOIN user_profiles AS receiver_profile ON receiver_profile.user_id = t1.receiver_id INNER JOIN users AS sender ON sender.id = t1.sender_id INNER JOIN users AS receiver ON receiver.id = t1.receiver_id LEFT JOIN admin_message_board_attachments AS attachment ON attachment.admin_message_board_id = t1.id WHERE (sender.role_id = 1 OR sender.role_id = "+receiver_role_id+") AND (receiver.role_id = 1 OR receiver.role_id = "+receiver_role_id+") AND (t1.sender_id = "+receiver_id+" OR t1.receiver_id = "+receiver_id+")";
                                                db.query(message_query, function(err, result){
                                                    if(!err){
                                                        result_data = {
                                                            'status_code': 200,
                                                            'message': 'Data Retrieve Successfully',
                                                            'data': result
                                                        };
                                                        io.sockets.emit('admin_contact_list_'+receiver_id, result_data);
                                                    }else{
                                                        console.log(JSON.stringify(err));
                                                    }
                                                });

                                            });
                                        }
                                        else{
                                            console.log(JSON.stringify(s3UpdateError));
                                        }
                                    }); // s3upload
                                } //s3error
                                else{
                                    console.log(JSON.stringify(s3Error));
                                }
                            });
                        } //insert error
                        else{
                            console.log(JSON.stringify(insertError));
                        }
                    });
                }
                else {
                    console.log('outtt');
                    console.log('request_another_slice');
                    client.emit('request_another_slice', { currentSlice: files[data.name].slice , 'message_board_room' : chat_data.message_board_room_id });
                }
            } // not filename
        }
        catch (error) {
            io.sockets.emit('response_chat_messages_error', error);
        }
    });

    client.on('notification_list', function(user_data){
        var user_id = user_data.user_id;
        db.query("SELECT * from notifications where user_id = "+user_id+" ORDER BY id DESC limit 5", function (err, result) {
            if (!err) {
                result_data = {
                    'status_code': 200,
                    'message': 'Notifications Retrieved Successfully',
                    'data': result
                };
                io.sockets.emit('notification_list_'+user_id, result_data);
            }else{
                result_data = {
                    'status_code': 200,
                    'message': 'Notifications Failed',
                    'data': result
                };
                io.sockets.emit('notification_list_'+user_id, result_data);
            }
        });
    });

    client.on('send_notification', function(notification_data){
       var user_id = notification_data.receiver_id;
       var reference_id = notification_data.reference_id;
       var notification = notification_data.notification;
       var notification_message = notification_data.notification_message;
       var type = notification_data.type;
       db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('"+notification+"', "+SqlString.escape(notification_message)+",'"+type+"', '"+user_id+"', '"+reference_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
            if(!notificationError){
                var notification_result = {
                    'id' : notificationSuccess.insertId,
                    'notification' : notification,
                    'notification_message' : notification_message,
                    'type' : type,
                    'user_id' : user_id,
                    'reference_id' : reference_id,
                    'status' : 0,
                    'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                    'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                };
                io.sockets.emit('new_notification_'+user_id, notification_result);
            }else{
            }
       });
    });

    client.on('early_session_start_request', function(session_data){
        var reference_id = session_data.reference_id; //session_id
        var tutor_id = session_data.tutor_id;
        var user_id = session_data.receiver_id;
        var job_id = session_data.job_id;
        var notification = session_data.notification;
        var notification_message = session_data.notification_message;
        var type = session_data.type;
        var schedule_date = session_data.schedule_date;
        var job_title = session_data.job_title;
        var full_name = session_data.full_name;
        db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('"+notification+"', "+SqlString.escape(notification_message)+",'"+type+"', '"+user_id+"', '"+reference_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
            if(!notificationError){
                var notification_result = {
                    'id' : notificationSuccess.insertId,
                    'notification' : notification,
                    'notification_message' : notification_message,
                    'type' : type,
                    'user_id' : user_id,
                    'tutor_id' : tutor_id,
                    'job_title' : job_title,
                    'schedule_date' : schedule_date,
                    'full_name' : full_name,
                    'job_id' : job_id,
                    'reference_id' : reference_id,
                    'status' : 0,
                    'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                    'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                };
                io.sockets.emit('session_request_'+user_id, notification_result);
            }else{
            }
        });
    });

    client.on('early_session_response', function(session_data){
        var reference_id = session_data.reference_id; //session_id
        var student_id = session_data.student_id;
        var user_id = session_data.receiver_id;
        var job_id = session_data.job_id;
        var notification = session_data.notification;
        var notification_message = session_data.notification_message;
        var type = session_data.type;
        var response_type = session_data.response_type;
        var job_title = session_data.job_title;
        var full_name = session_data.full_name;
        db.query("INSERT INTO notifications (notification, notification_message, type, user_id, reference_id , status, end_time_date, created_at,updated_at)  VALUES ('"+notification+"', "+SqlString.escape(notification_message)+",'"+type+"', '"+user_id+"', '"+reference_id+"' ,'0', NULL ,'"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"','"+moment.utc().format("YYYY-MM-DD HH:mm:ss")+"')", function(notificationError, notificationSuccess) {
            if(!notificationError){
                var notification_result = {
                    'id' : notificationSuccess.insertId,
                    'notification' : notification,
                    'notification_message' : notification_message,
                    'type' : type,
                    'user_id' : user_id,
                    'student_id' : student_id,
                    'job_id' : job_id,
                    'job_title' : job_title,
                    'full_name' : full_name,
                    'reference_id' : reference_id,
                    'response_type' : response_type,
                    'status' : 0,
                    'created_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                    'updated_at' : moment.utc().format("YYYY-MM-DD HH:mm:ss")
                };
                io.sockets.emit('session_response_'+user_id, notification_result);
            }else{
            }
        });
    });

    client.on('start_session', function (session_data){
        var response = {
            'full_name' : session_data.full_name,
            'session_id' : session_data.session_id,
            'tutor_id' : session_data.tutor_id,
            'job_id' : session_data.job_id,
            'job_title' : session_data.job_title,
            'student_id' : session_data.student_id
        }

        io.sockets.emit('session_started_'+session_data.student_id, response);
    });

    client.on('refresh_page', function(data){
       var student_id = data.user;
       var msg = data.message;
       io.sockets.emit('refresh_user_'+student_id, {'message' : msg});
    });

    client.on('notification_count', function(data){
       var user_id = data.user_id;
        db.query("SELECT COUNT(*) As notification_count from notifications where user_id = "+user_id+" and status = 0 ", function (err, result) {
            if (!err) {
                result_data = {
                    'status_code': 200,
                    'message': 'Notifications Count Successfully',
                    'data': result[0].notification_count
                };
                io.sockets.emit('notification_count_'+user_id, result_data);
            }else{
            }
        });
    });


});
redis.psubscribe('*', function (err, count) {
});

redis.on('pmessage', function (subscribed, channel, data) {
    data = JSON.parse(data);
    io.emit('session-start', data.data);
});
