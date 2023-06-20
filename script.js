function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function displayloginregisteretc(){
    var token = getCookie("Authorization");
    try {
    if (token == null || token == "") {
        document.getElementById("login").style.display = "block";
        document.getElementById("register").style.display = "block";
        document.getElementById("logout").style.display = "none";
        document.getElementById("createad").style.display = "none";
        document.getElementById("myadverts").style.display = "none";
        document.getElementById("myapplications").style.display = "none";
        document.getElementById("applicationstomine").style.display = "none";
    } else {
        document.getElementById("login").style.display = "none";
        document.getElementById("register").style.display = "none";
        document.getElementById("logout").style.display = "block";
        document.getElementById("createad").style.display = "block";
        document.getElementById("myadverts").style.display = "block";
        document.getElementById("myapplications").style.display = "block";
        document.getElementById("applicationstomine").style.display = "block";
    }
  } catch(error){}
}

function fetchAllAdverts() {
    fetch('http://localhost:8080/api/advert/view/all')
      .then(response => response.json())
      .then(data => {
        var adverts = data;
  
        var html = '';
        for (var i = 0; i < adverts.length; i++) {
          var advert = adverts[i];
          html += '<div class="advert">';
          html += '<img src="' + advert.imgLocation + '">';
          html += '<a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a>';
          html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
          html += '<a href="#" onclick="apply(' + advert.advertID + ')">[Apply]</a>';
          html += '</div>';
        }
        document.getElementById('advertisments').innerHTML = html;
  
      });
  }

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  function fetchAdvert(){
    fetch('http://localhost:8080/api/advert/view/advert/' + getQueryParam("id"))
    .then(response => response.json())
    .then(data => {
      var advert = data;
      var html = '';
      html += '<div class="advert">';
      html += '<img src="' + advert.imgLocation + '">';
      html += '<h1>' + advert.title + '</h1>';
      html += '<p>' + advert.description + '</p>';
      html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
      html += '<p>Posted by: ' + advert.userName + '</p>';
      html += '</div>';
      document.getElementById('advert').innerHTML = html; 
    }
    );
  }

  function login() {
    event.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var isAdmin;
    var credentials = {
      username: username,
      password: password
    };

    fetch('http://localhost:8080/api/admin/isadmin/' + username, {
      method: 'GET' })
      .then(response => response.json())
      .then(data => {
        isAdmin = data;
      }).catch(error => {
        console.log(response);
      });
  
    fetch('http://localhost:8080/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })
    .then(response => {
      if (!response.ok && response.status === 400) {
        throw Error();
      } else {
        return response.json(); 
      }
    })
    .then(data => {
      var token = data.authorization;
      document.cookie = "Authorization=" + token + "; path=/";
      document.cookie = "username=" + username + "; path=/";
      if(isAdmin == true){
        window.location.href = '/admin.html';
      } else {
      window.location.href = '/adverts.html';
      }
    })
    .catch(error => {
      alert("Invalid username/password");
    });

}

function fetchMyAdverts(){
  var username = getCookie("username");
  fetch('http://localhost:8080/api/advert/view/user/' + username,
  {
    headers: {
      Authorization: getCookie("Authorization")
  }})
  .then(response => {
    if (!response.ok && response.status === 400) {
      throw Error();
    } else {
      return response.json(); 
    }})
  .then(data => {
      var adverts = data;
      var html = '';
      for (var i = 0; i < adverts.length; i++) {
        var advert = adverts[i];
        html += '<div class="advert">';
        html += '<img src="' + advert.imgLocation + '">';
        html += '<a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a>';
        html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
        html += '<a href="#" onclick="deleteAdvert(' + advert.advertID + ')">[Delete]</a>';
        html += '<a href="/editadvert.html?advertId=' + advert.advertID + '">[Edit]</a>';
        html += '</div>';
      }
      document.getElementById('advertisments').innerHTML = html;
    })
    .catch(error => {
      alert("Session expired, please log in again");
    });
}

function deleteAdvert(advertID){
  var username = getCookie("username");
  fetch('http://localhost:8080/api/advert/delete/' + username + '/' + advertID,
  {
    method: 'DELETE',
    headers: {
      Authorization: getCookie("Authorization")
  }})
  .then(response => {
    if (!response.ok && response.status == 400) {
      throw Error();
    } else {
      alert("deletion successful");
      location.reload(true);
      window.location.href = '/myadverts.html';
    }})
    .catch(error => {
      alert("Session expired, please log in again");
    });
}


function uploadAdvert() {
    var username = getCookie("username");
    event.preventDefault();
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var price = document.getElementById('price').value;
    var imageFile = document.getElementById('image').files[0];
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = function() {
      var base64Image = reader.result.split(',')[1];
  
      var advertUploadDto = {
        title: title,
        description: description,
        price: price,
        imgName: imageFile.name,
        imgData: base64Image
      };
  
fetch('http://localhost:8080/api/advert/new/' + username, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getCookie('Authorization')
  },
  body: JSON.stringify(advertUploadDto)
})
.then(response => {
  if (response.status === 204) {
    alert("Advert uploaded successfully");
    window.location.href = '/adverts.html';
  } else {
    throw Error();
  }
})
.catch(error => {
  alert("Error uploading advert");
});
    };
}

function fetchToMineApplications(){
    var username = getCookie("username");
    fetch('http://localhost:8080/api/application/formine/' + username,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('Authorization')
    }})
    .then(response => {
      console.log(response);
      if (!response.ok && response.status === 400) {
        throw Error();
      } else {
        return response.json(); 
      }})
      .then(data => {
        console.log(data);
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var advert = data[i];
            html += '<div class="advert">';
            html += '<h3><a href="/advert.html?id=' + advert.advertMinimalDto.advertID +'">' + advert.advertMinimalDto.title + '</a></h3>';
            html += '<p>Applied by: ' + advert.username + '</p>';
            html += '</div>';
        }
        document.getElementById('applications').innerHTML = html;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function deleteCookie(name) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function logout(){
  deleteCookie("Authorization");
  deleteCookie("username");
}

if(window.location.pathname.endsWith('register.html')) {
document.getElementById('registrationForm').addEventListener('submit', function(event) {
  event.preventDefault();
  
  var username = document.getElementById('username').value;
  var email = document.getElementById('email').value;
  var password = document.getElementById('password').value;
  var phone = document.getElementById('phone').value;

  var userEntity = {
      username: username,
      email: email,
      password: password,
      phone: phone
  };

  fetch('http://localhost:8080/api/user', {
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  },
  body: JSON.stringify(userEntity)
  })
  .then(response => {
    console.log(response);
  if (response.status === 204) {
    alert("Registration successful");
    window.location.href = '/login.html';
  } else {
    throw Error();
  }
  })
  .catch(error => {
    alert("Registration failed");
    console.log(error);
  });
});
}

function fetchFromMineApplications(){
  var username = getCookie("username");
  fetch('http://localhost:8080/api/application/forothers/' + username,{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('Authorization')
    }})
    .then(response => {
      console.log(response);
      if (!response.ok && response.status == 400) {
        throw Error();
      } else {
        return response.json(); 
      }})
      .then(data => {
        console.log(data);
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var advert = data[i];
            html += '<div class="advert">';
            html += '<h3><a href="/advert.html?id=' + advert.advertMinimalDto.advertID +'">' + advert.advertMinimalDto.title + '</a></h3>';
            html += '<a href="#" onclick="deleteApplication(' + advert.applicationId + ')">[Delete application]</a>';
            html += '</div>';
        }
        document.getElementById('applications').innerHTML = html;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function apply(id){
  var username = getCookie("username");
  var application = {
    advertMinimalDto:{
      advertID: id
    },
    username: username
};
  fetch('http://localhost:8080/api/application/mine/' + username,
  {
    method: 'POST',
    body: JSON.stringify(application),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': getCookie("Authorization"),
  }})
  .then(response => {
    console.log(response);
    if (response.status == 400) {
      throw Error();
    } else {
      alert("application successful");
    }})
    .catch(error => {
      alert("Session expired, please log in again");
    });
}

window.onload = function() {

  displayloginregisteretc();

if(window.location.pathname.endsWith('admin.html')) {
  fetchAllAdvertsAsAdmin();
}

if(window.location.pathname.endsWith('adminlist.html')) {
  fetchAdminList();
}

if(window.location.pathname.endsWith('editadvert.html')) {
  document.getElementById('advertEditForm').addEventListener('submit', function(event) {
    console.log("submit");
    var advertID = getQueryParam("advertId");
    var username = getCookie("username");
    event.preventDefault();
    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var price = document.getElementById('price').value;
    var imageFile = document.getElementById('image').files[0];
    var reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = function() {
      var base64Image = reader.result.split(',')[1];
  
      var advertUploadDto = {
        title: title,
        description: description,
        price: price,
        imgName: imageFile.name,
        imgData: base64Image
      };
  
fetch('http://localhost:8080/api/advert/edit/' + username + '/' + advertID, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getCookie('Authorization')
  },
  body: JSON.stringify(advertUploadDto)
})
.then(response => {
  if (response.status === 204) {
    alert("Advert edited successfully");
    window.location.href = '/myadverts.html';
  } else {
    throw Error();
  }
})
.catch(error => {
  alert("Error uploading advert");
});
};
});
}
}

function deleteApplication(applicationId){
  var username = getCookie("username");
  fetch('http://localhost:8080/api/application/mine/' + username + '/' + applicationId, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + getCookie('Authorization')
  },
})
.then(response => {
  if (response.status === 204) {
    alert("Application deleted sucessfully");
    window.location.href = '/myapplications.html';
  } else {
    throw Error();
  }
})
.catch(error => {
  alert("Error deleting application");
  console.log(response);
});

}

function fetchAllAdvertsAsAdmin() {
  fetch('http://localhost:8080/api/advert/view/all')
    .then(response => response.json())
    .then(data => {
      var adverts = data;

      var html = '';
      for (var i = 0; i < adverts.length; i++) {
        var advert = adverts[i];
        html += '<div class="advert">';
        html += '<img src="' + advert.imgLocation + '">';
        html += '<a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a>';
        html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
        html += '<a href="#" onclick="deleteAsAdmin(' + advert.advertID + ')">[Delete]</a>';
        html += '</div>';
      }
      document.getElementById('advertisments').innerHTML = html;

    });
}

function deleteAsAdmin(advertID){

  var username;
  fetch('http://localhost:8080/api/advert/view/advert/' + advertID)
    .then(response => response.json())
    .then(data => {
      username = data.userName;
      fetch('http://localhost:8080/api/advert/delete/' + username + '/' + advertID,
      {
        method: 'DELETE',
        headers: {
          Authorization: getCookie("Authorization")
      }})
      .then(response => {
        if (!response.ok && response.status != 204) {
          throw Error();
        } else {
          alert("deletion successful"); 
          location.reload(true);
          window.location.href = '/admin.html';
        }})
        .catch(error => {
          alert("You arent allowed to delete this advert");
        });
    }
  );
}

function fetchAdminList(){
  fetch('http://localhost:8080/api/admin/admin-users')
    .then(response => response.json())
    .then(data => {
      var admins = data;

      var html = '';
      for (var i = 0; i < admins.length; i++) {
        var admin = admins[i];
        html += '<div class="admin">';
        html += '<p>' + admin.username + '</p>';
        html += '</div>';
      }
      document.getElementById('admins').innerHTML = html;

    });
}