const client = stitch.Stitch.initializeDefaultAppClient('evie_tracker-qprfn');
const db = client.getServiceClient(stitch.RemoteMongoClient.factory, 'mongodb-atlas').db('log_entries');

function display_log_entries_on_load() {
    client.auth
    .loginWithCredential(new stitch.AnonymousCredential())
    .then(refresh_log_entries)
    .catch(console.error);
}

function actionToggle() {
    var blur = document.getElementById('blur');
    blur.classList.toggle('blur');
    var action = document.querySelector('.action');
    action.classList.toggle('active');
}

function close_Input_Modal() {
    document.getElementById('blur').classList.toggle('blur');
    document.querySelector('.action').classList.toggle('blur');
    document.querySelector('.input-modal-bg').classList.toggle('show-input-modal');
}

function check_volume() {
    if(document.getElementById('volume').value=='') {
        document.getElementById('volume').value = blog_entry.querySelector('.volume_value').innerText;
    }
}

function addZero(i) {
if (i < 10) {
    i = "0" + i;
}
return i;
}

function format_date(date) {
    days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    d = new Date(date);
    return days[d.getDay()] + " " + d.getDate() + " " + months[d.getMonth()];
}

function show_charts() {
    window.location.href = "https://9904989.github.io/milk_chart/";
}

function show_table() {
    window.location.href = "https://9904989.github.io/table_test/";
}

//Create new Log Entry
function addEntry(icon_value) {
    //set up default values
    var d = new Date();
    var time_value = addZero(d.getHours()) + ":" + addZero(d.getMinutes());
    var volume_value = '0';
    var comment_value = '';
    var timestamp_value = Date.now();
    var date_value = d.getFullYear()+"-"+addZero(d.getMonth()+1)+"-"+addZero(d.getDate());

    //insert new log entry into mongo { owner_id : client.auth.user.id }
    if(icon_value=="dog_bowl") {
        db.collection('scruffy_log').insertOne({'time': time_value, 'icon': icon_value, 'volume': volume_value, 'comment': comment_value, 'timestamp': timestamp_value, 'blog_date': date_value });
    } else {
        db.collection('scruffy_log').insertOne({'time': time_value, 'icon': icon_value, 'comment': comment_value, 'timestamp': timestamp_value, 'blog_date': date_value });
    }
    //generate DOM Elements (5x parts, time, icon/volume, comment, timestamp and date)
    new_entry = document.createElement("div");
    new_entry.classList.add("log_entry");
    new_entry.setAttribute("onclick","edit_log_entry(this);");

    //time hh:mm
    new_entry_time = document.createElement("div");
    new_entry_time.classList.add("time");
    new_entry_time.innerText = time_value;
    new_entry.appendChild(new_entry_time);

    //icon/volume
    if(icon_value=="dog_bowl") {
        new_entry_volume = document.createElement("div");
        new_entry_volume.classList.add("volume");
        new_entry_volume.innerHTML = "<a class='volume_value'>"+volume_value+"</a>g  <img class='dog_bowl' src='dog_bowl.png'>";
        new_entry.appendChild(new_entry_volume);
    } else {
        new_entry_icon = document.createElement("div");
        new_entry_icon.classList.add("icon");
        new_icon = document.createElement("img");
        new_icon.src = icon_value;
        new_entry_icon.appendChild(new_icon);
        new_entry.appendChild(new_entry_icon);
    }
    
    //comment (maybe include a calculation of time since last change)
    new_entry_comment = document.createElement("div");
    new_entry_comment.classList.add("comment");
    new_entry_comment.innerText = comment_value;
    new_entry.appendChild(new_entry_comment);

    //timestamp (for finding the log entry)
    new_entry_timestamp = document.createElement("div");
    new_entry_timestamp.classList.add("timestamp");
    new_entry_timestamp.innerText = timestamp_value;
    new_entry.appendChild(new_entry_timestamp);
    
    //date (for sorting the list)
    new_entry_date = document.createElement("div");
    new_entry_date.classList.add("blog_date");
    new_entry_date.innerText = date_value;
    new_entry.appendChild(new_entry_date);

    //add new entry to start of content <div>
    var log_entries = document.getElementById("log_entries");
    log_entries.insertBefore(new_entry, log_entries.childNodes[0]);
}

//Read log entries from mongo
function refresh_log_entries() {
    db.collection('scruffy_log')
    .find({}, {limit: 100, sort: {"blog_date": -1, "time": -1}})
    .toArray()
    .then(docs => {
        const html = "";
        document.getElementById("log_entries").innerHTML = docs.map(doc =>
        (doc.icon == "dog_bowl") ? 
        //add a feed entry
        '<div class="log_entry" onclick="edit_log_entry(this);">'
        //+`<div class="time">${doc.time}\n${format_date(doc.timestamp)}</div>`
        +`<div class="time">${doc.time}</div>`
        +`<div class="volume"><a class="volume_value">${doc.volume}</a>g <img class="dog_bowl" src="dog_bowl.png"></div>`
        +`<div class="comment">${doc.comment}</div>`
        +`<div class="timestamp">${doc.timestamp}</div>`
        +`<div class="blog_date">${doc.blog_date}</div>`
        +`</div>`
        :
        //add a nappy entrys
        '<div class="log_entry" onclick="edit_log_entry(this);">'
        //+`<div class="time">${doc.time}\n${format_date(doc.timestamp)}</div>`
        +`<div class="time">${doc.time}</div>`
        +`<div class="icon"><img src=${doc.icon}></div>`
        +`<div class="comment">${doc.comment}</div>`
        +`<div class="timestamp">${doc.timestamp}</div>`
        +`<div class="blog_date">${doc.blog_date}</div>`
        +`</div>`
        ).join(' ');
    }).catch(err => {
    });
}

//set up the edit modal window
function edit_log_entry(e) {
    e = e || window.event;
    //var src = e.target || e.srcElement;
    blog_entry = e;
    //hide the volume entry if not a food entry
    if(!blog_entry.querySelector('.volume')) {
        document.getElementById('edit_volume').classList.add('hide_volume_input_field');
    }
    document.getElementById('edit_time').value = blog_entry.querySelector('.time').innerText;
    document.getElementById('edit_date').value = blog_entry.querySelector('.blog_date').innerText;
    //if its a food entry, make sure the volume input is populated and visible
    if(blog_entry.querySelector('.volume')) {
        document.getElementById('volume').value = blog_entry.querySelector('.volume_value').innerText;
        document.getElementById('edit_volume').classList.remove('hide_volume_input_field');
    }
    document.getElementById('modal_timestamp').innerText = blog_entry.querySelector('.timestamp').innerText;
    document.getElementById('edit_comment').value = blog_entry.querySelector('.comment').innerText;
    document.getElementById('blur').classList.toggle('blur');
    document.querySelector('.action').classList.toggle('blur');
    document.querySelector('.input-modal-bg').classList.toggle('show-input-modal');
}

//update log entry in mongo
function update_log_entry() {
    //update the volume entry
    if(blog_entry.querySelector('.volume')) {
        db.collection('scruffy_log')
        .updateOne({"timestamp": Number(blog_entry.querySelector('.timestamp').innerText)}, {$set:{"time":document.getElementById('edit_time').value, "volume":document.getElementById('volume').value, "comment":document.getElementById('edit_comment').value, "blog_date":document.getElementById('edit_date').value}}, {upsert:true})
        .then(() => {
            blog_entry.querySelector('.time').innerText = document.getElementById('edit_time').value;
            blog_entry.querySelector('.volume_value').innerText = document.getElementById('volume').value;
            blog_entry.querySelector('.comment').innerText = document.getElementById('edit_comment').value;
            blog_entry.querySelector('.blog_date').innerText = document.getElementById('edit_date').value;
            close_Input_Modal();
            refresh_log_entries();
            blog_entry.querySelector('.blog_date').innerText += '';
        })    
        .catch(err => {
        });
    //update the nappy entry
    } else {
        db.collection('scruffy_log')
        .updateOne({"timestamp": Number(blog_entry.querySelector('.timestamp').innerText)}, {$set:{"time":document.getElementById('edit_time').value, "comment":document.getElementById('edit_comment').value, "blog_date":document.getElementById('edit_date').value}}, {upsert:true})
        .then(() => {
            blog_entry.querySelector('.time').innerText = document.getElementById('edit_time').value;
            blog_entry.querySelector('.comment').innerText = document.getElementById('edit_comment').value;
            blog_entry.querySelector('.blog_date').innerText = document.getElementById('edit_date').value;
            close_Input_Modal();
            refresh_log_entries();
            blog_entry.querySelector('.blog_date').innerText += '';
        })    
        .catch(err => {
        });
    }
}

//delete log entry from mongo
function delete_log_entry() {
    var confirm_delete = confirm("Delete Log Entry?")
    if(confirm_delete==true) {
        db.collection('scruffy_log')
        .deleteOne({"timestamp": Number(blog_entry.querySelector('.timestamp').innerText)})
        .then(() => { 
            blog_entry.remove();
            close_Input_Modal();
        })    
        .catch(err => {
        });
    }
}