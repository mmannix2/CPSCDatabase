<?php
/*
Database connection info
$DB_HOST = "127.0.0.1";
$DB_USER = "api";
$DB_PASSWORD = "password";
$DB_NAME = "db";
*/

/*
api actions:
    get jobs
    post job
    post volunteer
    get announcements
admin actions: These require admin login and adminKey authentication
    delete job
    get volunteers
    delete volunteer
    post announcement
    delete announcement
*/

$ADMIN_KEY = 123456789;

function connectToDB($user) {
    $options = array( PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION );
    switch($user) {
        case 'api':
            return new PDO("mysql:host=127.0.0.1;dbname=db", "api", "password", $options);
        break;
        case 'admin':
            return new PDO("mysql:host=127.0.0.1;dbname=db", "admin", "admin", $options); //For whatever reason, admin doesn't like to use a password
        break;
    }
}

/* Delete Function */
function deleteRow($table, $id) {
    try {
        $db = connectToDB('admin');
        
        $query = 'DELETE FROM ';
        $query .= $table;
        $query .= ' WHERE id = :id';
        
        //echo $query;
        
        $stmt = $db->prepare($query);
        //$stmt->bindParam(':table', $table, PDO::PARAM_STR, 13);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
         
        $stmt->execute();
        
        if($stmt->rowCount() == 0) {
            http_response_code(404);
            return json_encode(array("success" => false));
        }
        else {
            http_response_code(200);
            return json_encode(array("success" => true));
        }
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to delete row " .$id ." of " .$table, "message" => $e.message));
    }
}

/* Get Functions */
function get($table) {
    try {
        //Connect to DB
        $db = connectToDB("api");
        
        $query = 'SELECT * FROM ';
        $query .= $table;
        $query .= ' ORDER BY id DESC';
         
        //echo $query;
        
        //Get Result
        $results = $db->query($query)->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($results);
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to load " .$table));
    }
}

function adminGet($table) {
    try {
        //Connect to DB
        $db = connectToDB("admin");
        
        $query = 'SELECT * FROM ';
        $query .= $table;
        $query .= ' ORDER BY id DESC';
        
        //echo $query;
        
        //Get Result
        $results = $db->query($query)->fetchAll(PDO::FETCH_ASSOC);
        return json_encode($results);
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to load " .$table));
    }
}

/* Post Functions */
function postJob($postJobInfo) {
    try {
        //Connect to DB
        $db = connectToDB('api');
        
        $query1 = "INSERT INTO jobs (jobTitle, companyName, description, location, jobType";
        $query2 = ") VALUES (:jobTitle, :companyName, :description, :location, :jobType";
        
        if(!empty($postJobInfo[email])) {
            $query1 .= ", email";
            $query2 .= ", :email";
        }
        if(!empty($postJobInfo[link])) {
            $query1 .= ", link";
            $query2 .= ", :link";
        }
        
        $query = $query1 . $query2 . ")";
         
        //Insert this job into the DB
        $stmt = $db->prepare($query);
        
        //if(array_key_exists)
        
        $stmt->bindParam(':jobTitle', $postJobInfo[jobTitle]);
        $stmt->bindParam(':companyName', $postJobInfo[companyName]);
        $stmt->bindParam(':description', $postJobInfo[description]);
        $stmt->bindParam(':location', $postJobInfo[location]);
        $stmt->bindParam(':jobType', $postJobInfo[jobType]);
        
        if(!empty($postJobInfo[email])) {
            $stmt->bindParam(':email', $postJobInfo[email]);
        }
        if(!empty($postJobInfo[link])) {
            $stmt->bindParam(':link', $postJobInfo[link]);
        }
        
        $stmt->execute();
        
        $newId = $db->lastInsertId();
        //$stmt->close();
        
        return json_encode(array("success" => true));
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to post job.", "message" => $e.message));
    }
}

function searchJobs($searchTerm) {
    try {
    //Connect to DB
    $db = connectToDB('api');
        $query = 'SELECT * FROM jobs';
        
        if(strcasecmp($searchTerm,'fulltime') == 0) {
            $searchTerm = 'full time';
        }
        
        if($searchTerm != NULL && !empty($searchTerm)) {
            $query .= ' WHERE jobTitle LIKE :searchTerm OR companyName LIKE :searchTerm OR jobType LIKE :searchTerm OR description LIKE :searchTerm OR location = :location';
            
            $stmt = $db->prepare($query);
            $stmt->bindValue(':searchTerm', '%'.$searchTerm.'%', PDO::PARAM_STR);
            $stmt->bindValue(':location', intval($searchTerm), PDO::PARAM_INT);
            
            $stmt->execute();
            
            return json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to search jobs.", "message" => $e));
    }
}

function postVolunteer($postVolunteerInfo) {
    try {
        //Connect to DB
        $db = connectToDB('api');
        $query = "INSERT INTO volunteers (name, email, description) VALUES (:name, :email, :description)";
        
        //Insert this job into the DB
        $stmt = $db->prepare($query);
        $stmt->bindParam(':name', $postVolunteerInfo[name]);
        $stmt->bindParam(':email', $postVolunteerInfo[email]);
        $stmt->bindParam(':description', $postVolunteerInfo[description]);
        $stmt->execute();
        
        $newId = $db->lastInsertId();
        
        return json_encode(array("success" => true));
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to post volunteer.", "message" => $e.message));
    }
}

function postAnnouncement($postVolunteerInfo) {
    try {
        //Connect to DB
        $db = connectToDB('api');
        $query = "INSERT INTO announcements (title, description) VALUES (:title, :description)";
        
        //Insert this job into the DB
        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $postVolunteerInfo[title]);
        $stmt->bindParam(':description', $postVolunteerInfo[description]);
        $stmt->execute();
        
        $newId = $db->lastInsertId();
        
        return json_encode(array("success" => true));
    }
    catch(PDOException $e) {
        return json_encode(array("error" => "Failed to post announcement.", "message" => $e.message));
    }
}

/* Admin Login */
function login($loginInfo) {
    if( strcasecmp($loginInfo[username], "admin") == 0 && strcmp($loginInfo[password], "admin") == 0 ) {
        //Generate a secret key and pass it to the user.
        if($ADMIN_KEY == NULL) {
            $ADMIN_KEY = "123456789"; //Use some bassass hash or something
        }
        http_response_code(200);
        return json_encode(array("adminKey" => $ADMIN_KEY));
    }
    else {
        http_response_code(403);
        return json_encode(array("status" => "failure"));
    }
}

/* Authenticate adminKey */
function auth($ADMIN_KEY, $adminKey) {
    return $ADMIN_KEY == $adminKey;
}

//Get the request
$requestURI = $_SERVER['REQUEST_URI'];
$requestParts = explode('/', rtrim($requestURI, '/'));
$auth_token = 0;

//Look through the headers for 'authorization'
foreach (getallheaders() as $name => $value) {
    if($name == 'authorization') {
        $auth_token = $value;
    }
}

switch($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch($requestParts[2]) {
            //If looking for jobs or announcements, go ahead
            case 'jobs':
            case 'announcements':
                echo get($requestParts[2]);
            break;
            //If looking for volunteers, authenticate first
            case 'volunteers':
                if(auth($ADMIN_KEY, $auth_token)) {
                    echo adminGet($requestParts[2]);
                }
                else {
                    http_response_code(403);
                    return json_encode(array("success" => false));
                }
            break;
        }
        break;
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        //These are all pretty unique, so they have their own functions
        switch($requestParts[2]) {
            //api/jobs
            case 'jobs':
                echo postJob($data);
            break;
            //api/volunteers
            case 'volunteers':
                echo postVolunteer($data);
            break;
            //api/announcements
            case 'announcements':
                //Authenticate first
                if(auth($ADMIN_KEY, $auth_token)) {
                    echo postAnnouncement($data);
                }
                else {
                    http_response_code(403);
                    return json_encode(array("success" => false));
                }
            break;
            //api/search
            case 'search':
                echo searchJobs($data[searchTerm]);
            break;
            //api/login
            case 'login':
                echo login($data, $ADMIN_KEY);
            break;
        }
        break;
    case 'DELETE':
        //Authenticate first
        if(auth($ADMIN_KEY, $auth_token)) {
            echo deleteRow($requestParts[2], $requestParts[3]);
        }
        else {
            http_response_code(403);
            return json_encode(array("success" => false));
        }
        break;
    default:
        echo json_encode(array("error" => "Unsupported method used."));
        break;
}

?>