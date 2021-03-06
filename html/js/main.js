var app = angular.module('CPSCDatabase', ['ngCookies']);

app.factory('dataFactory', ['$http',
    function($http) {
        return {
            getJobs: function () {
                var promise = $http.get('/api/jobs')
                .then(function (response) {
                    console.log(response.data);
                    return response.data;
                }, function (response) {
                    //Error
                    console.log(response.error);
                });
                return promise;
            },
            postJob: function (postJobInfo) {
                var promise = $http.post('/api/jobs', postJobInfo) 
                .then(function (response){
                    console.log(response.data);
                    return response.data;
                }, function (response){
                    //Error
                    console.log(response.error);
                    console.log(response.message);
                });
                return promise;
            },
            getVolunteers: function (adminKey) {
                var promise = $http.get('/api/volunteers', {
                    headers: {
                        "Authorization": adminKey
                    }
                })
                .then(function (response) {
                    console.log(response.data);
                    return response.data;
                }, function (response) {
                    //Error
                    console.log(response.error);
                });
                return promise;
            },
            postVolunteer: function (postVolunteerInfo) {
                var promise = $http.post('/api/volunteers', postVolunteerInfo) 
                .then(function (response) {
                    console.log(response.data);
                    return response.data;
                }, function (response) {
                    //Error
                    console.log(response.error);
                    console.log(response.message);
                });
                return promise;
            },
            //If the correct credentials are given, a token is returned
            login: function (loginInfo) {
                var promise = $http.post('/api/login', loginInfo)
                .then(function (response) {
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Login succeded.");
                    return response.data.adminKey;
                }, function(response) {
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Login authentication failed.");
                    return undefined;
                });
                return promise;
            },
            deleteJob: function (adminKey, jobNumber) {
                var promise = $http.delete('/api/jobs/'.concat(jobNumber), {
                    headers: {
                        "Authorization": adminKey
                    }
                })
                .then(function (response) {
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Deleted job.");
                }, function(response){
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Failed to delete job.");
                });
                return promise;
            },
            deleteVolunteer: function (adminKey, volunteerNumber) {
                var promise = $http.delete('/api/volunteers/'.concat(volunteerNumber), {
                    headers: {
                        "Authorization": adminKey
                    }
                })
                .then(function (response) {
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Deleted volunteer.");
                }, function(response){
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Failed to delete volunteer.");
                });
                return promise;
            },
            getAnnouncements: function () {
                var promise = $http.get('/api/announcements/')
                .then(function (response) {
                    console.log(response.data);
                    return response.data;
                }, function (response) {
                    //Error
                    console.log(response.error);
                });
                return promise;
            },
            postAnnouncement: function (adminKey, postAnnouncementInfo) {
                var promise = $http.post('/api/announcements', postAnnouncementInfo, {
                    headers: {
                        "Authorization": adminKey
                    }
                }) 
                .then(function (response) {
                    console.log(response.data);
                    return response.data;
                }, function (response) {
                    //Error
                    console.log(response.error);
                    console.log(response.message);
                });
                return promise;
            },
            deleteAnnouncement: function (adminKey, announcementNumber) {
                var promise = $http.delete('/api/announcements/'.concat(announcementNumber), {
                    headers: {
                        "Authorization": adminKey
                    }
                })
                .then(function (response) {
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Deleted announcement.");
                }, function(response){
                    console.log("Response: " + response.status + " " + response.statusText);
                    console.log("Failed to delete announcement.");
                });
                return promise;
            },
            searchJobs: function (searchTerm) {
                var promise = $http.post('/api/search', {"searchTerm":searchTerm})
                .then( function(response) {
                    console.log("Search Worked!");
                    console.log(response.data);
                    return response.data;
                }, function(response) {
                    console.log("Search Failed :(");
                    return undefined;
                });
                return promise;
            }
        };
    }
]);

app.controller('controller', ['$scope', '$cookies', 'dataFactory' ,
    function ($scope, $cookies, dataFactory) {
        $scope.allJobs = undefined;
        $scope.jobs = undefined;
        $scope.volunteers = undefined;
        $scope.announcements = undefined;
        $scope.searched = false;
        
        $scope.contactType = undefined;
        
        //Contains the data from the search jobs form
        $scope.searchTerm = '';
        
        //Contains the data from the log in form
        $scope.loginInfo = {
            "username": undefined,
            "password": undefined
        }; 
        
        //Contains the data from the post a job form
        $scope.postJobInfo = {
            "jobTitle": undefined,
            "companyName": undefined,
            "description": undefined,
            "location": undefined,
            "jobType": undefined,
            "email": undefined,
            "link": undefined
        };
        
        $scope.postJobStatus = "Job not yet submitted.";
        
        //Contains the data from a volunteer
        $scope.postVolunteerInfo = {
            "name": undefined,
            "email": undefined,
            "description": undefined
        };
        
        $scope.postVolunteerStatus = "Volunteer data not yet submitted.";
        
        //Contains the data from an announcement
        $scope.postAnnouncementInfo = {
            "title": undefined,
            "description": undefined
        };
        
        $scope.postAnnouncementStatus = "Announcement not yet submitted.";
        
        $scope.loadData = function loadData() {
            $scope.adminKey = $cookies.get('adminKey');
            console.log("adminKey: " + $scope.adminKey);
            
            dataFactory.getJobs().then(function (data) {
                $scope.allJobs = data;
                $scope.jobs = JSON.parse(JSON.stringify($scope.allJobs));
            }, function (error) {
                console.log(error);
            });
            
            dataFactory.getAnnouncements().then(function (data) {
                $scope.announcements = data;
            }, function (error) {
                console.log(error);
            });
            
            if($scope.adminKey != undefined) {
                dataFactory.getVolunteers($scope.adminKey).then(function (data) {
                    $scope.volunteers = data;
                }, function (error) {
                    console.log(error);
                });
            }
        };
        
        $scope.loadData();
        
        //Post functions
        $scope.postJobClicked = function postJobClicked() {
            console.log("Trying to post a job.");
            console.log($scope.postJobInfo);
            console.log($scope.contactType);
            //Verify email
            /*
            //We should check to make sure the email is valid
            if($scope.contactType == 0) {
                console.log('verifying email');
            }
            */
            //link format
            /*
            //We should check to make sure the link is valid
            if($scope.contactType == 1) {
                console.log('verifying link');
            }
            */
            //Add this job to the DB
            dataFactory.postJob($scope.postJobInfo)
            .then(function(response){
                //Add this job to the local array of jobs 
                $scope.jobs.push($scope.postJobInfo);
                
                //Clear the form
                $scope.postJobInfo=[];
                
                //Change the status message
                $scope.postJobStatus = "Job posted successfully!";
            }, function(response){
                //Change the status message
                $scope.postJobStatus = "Job post failed!";
            });
        };
        
        $scope.postVolunteerClicked = function postVolunteerClicked() {
            console.log("Trying to post a volunteer.");
            console.log($scope.postVolunteerInfo);
            //Add this volunteer to the DB
            dataFactory.postVolunteer($scope.postVolunteerInfo)
            .then(function(response){
                //Add this volunteer to the local array of volunteers
                if($scope.volunteers != undefined) {
                    $scope.volunteers.push($scope.postVolunteerInfo);
                }
                
                //Clear the form
                $scope.postVolunteerInfo=[];
                
                //Change the status message
                $scope.postVolunteerStatus = "Volunteer data posted successfully!";
            }, function(response){
                //Change the status message
                $scope.postVolunteerStatus = "Volunteer data post failed!";
            });
        };
        
        $scope.postAnnouncementClicked = function postAnnouncementClicked() {
            console.log("Trying to post an Announcement.");
            console.log($scope.postAnnouncementInfo);
            //Add this announcement to the DB
            dataFactory.postAnnouncement($scope.adminKey, $scope.postAnnouncementInfo)
            .then(function(response) {
                //Add this announcement to the local array of announcements 
                $scope.announcements.push($scope.postAnnouncementInfo);
                
                //Clear the form
                $scope.postAnnouncementInfo=[];
            
                //Change the status message
                $scope.postAnnouncementStatus = "Announcement posted successfully!";
            }, function(response) {
                //Change the status message
                $scope.postAnnouncementStatus = "Announcement post failed!";
            
                $scope.adminKey = undefined;
            });
        };
        
        //Delete functions
        $scope.deleteJobClicked = function deleteJobClicked(jobNumber) {
            console.log("Deleting job #" + jobNumber);
            dataFactory.deleteJob($scope.adminKey, jobNumber).then(function (response){
                //If Authentication succeeds, delete job
                //Delete the job from $scope.jobs
                var i = 0;
                for(var len = $scope.jobs.length; i < len; i++) {
                    if($scope.jobs[i].id == jobNumber) {
                        break;
                    }
                }
                $scope.jobs.splice(i, 1);
            }, function (response) {
                //Else sign the user out
                alert("Failed to delete job! Please try to login again and try again.");
                $scope.adminKey = undefined;
            });
        };
        
        $scope.deleteVolunteerClicked = function deleteVolunteerClicked(volunteerNumber) {
            console.log("Deleting volunteer #" + volunteerNumber);
            dataFactory.deleteVolunteer($scope.adminKey, volunteerNumber).then( function (response) {
                //If Authentication succeeds, delete volunteer
                //Delete the volunteer from $scope.volunteers
                var i = 0;
                for(var len = $scope.volunteers.length; i < len; i++) {
                    if($scope.volunteers[i].id == volunteerNumber) {
                        break;
                    }
                }
                $scope.volunteers.splice(i, 1);
            }, function (response) {
                //Else sign the user out
                alert("Failed to delete volunteer! Please try to login again and try again.");
                $scope.adminKey = undefined;
            });
        };
        
        $scope.deleteAnnouncementClicked = function deleteAnnouncementClicked(announcementNumber) {
            console.log("Deleting announcement #" + announcementNumber);
            dataFactory.deleteAnnouncement($scope.adminKey, announcementNumber).then( function (response) {
                //If Authentication succeeds, delete announcement
                //Delete the volunteer from $scope.announcements
                var i = 0;
                for(var len = $scope.announcements.length; i < len; i++) {
                    if($scope.announcements[i].id == announcementNumber) {
                        break;
                    }
                }
                $scope.announcements.splice(i, 1);
            }, function (response) {
                //Else sign the user out
                alert("Failed to delete announcement! Please try to login again and try again.");
                $scope.adminKey = undefined;
            });
        };
        
        //Search function
        $scope.searchJobsClicked = function searchJobsClicked() {
            console.log('Searching for jobs.');
            console.log($scope.searchTerm);
            
            dataFactory.searchJobs($scope.searchTerm).then(function(response){
                $scope.jobs = response; 
                console.log($scope.jobs);
            }, function(response) {
               $scope.jobs = response; 
            });
            $scope.searched = true;
            console.log($scope.searched);
            
            $scope.searchTerm = "";
        };
        
        //Login and logout functions
        $scope.loginClicked = function loginClicked() {
            console.log("Logging in.");
            console.log($scope.loginInfo);
            
            dataFactory.login($scope.loginInfo).then(function (adminKey) {
                //If authentication succeeds, store a cookie with the server's adminKey for 5 hours
                var now = new Date();
                var expiration = new Date(now);
                
                expiration.setMinutes(now.getMinutes() + 5 * (60));
                $scope.adminKey = adminKey;
                $cookies.put('adminKey', adminKey, {'expires' : expiration});
                console.log(adminKey);
                $scope.loadData();
            }, function() {
                $cookies.put('adminKey', undefined); 
                $scope.adminKey = undefined;
            });
        };
        
        $scope.logoutClicked = function logoutClicked() {
            console.log("Logging out.");
            $cookies.put('adminKey', undefined);
            $scope.adminKey = undefined;
            $scope.$apply();
        };
        
        $scope.dismissSearchClicked = function dismissSearchClicked() {
            $scope.searched = false;
            $scope.jobs = $scope.allJobs;
        };
    }
]);