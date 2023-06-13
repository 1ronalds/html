window.onload = function() {
  displayloginregisteretc();
};

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
}

function fetchAllAdverts() {
    fetch('http://localhost:8080/api/advert/view/all')
      .then(response => response.json())
      .then(data => {
        var adverts = data; // Assign the fetched data to the adverts variable
  
        var html = '';
        for (var i = 0; i < adverts.length; i++) {
          var advert = adverts[i];
          html += '<div class="advert">';
          html += '<img src="' + advert.imgLocation + '">';
          html += '<a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a>';
          html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
          html += '</div>';
        }
        document.getElementById('advertisments').innerHTML = html; // Update the HTML
  
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
  
    var credentials = {
      username: username,
      password: password
    };
  
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
      window.location.href = '/adverts.html';
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
      var adverts = data; // Assign the fetched data to the adverts variable
      var html = '';
      for (var i = 0; i < adverts.length; i++) {
        var advert = adverts[i];
        html += '<div class="advert">';
        html += '<img src="' + advert.imgLocation + '">';
        html += '<a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a>';
        html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
        html += '</div>';
      }
      document.getElementById('advertisments').innerHTML = html; // Update the HTML
    })
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
      .then(response => response.json())
      .then(data => {
        if(data.status === 200) {
          alert("Advert uploaded successfully");
          window.location.href = '/adverts.html';
        } else {
          throw Error();
        }
      })
      .catch(error => {
        console.log(error);
      });
    };
}

function fetchToMineApplications(){
    var username = getCookie("username");
    fetch('http://localhost:8080/api/application/mine/' + username + '/formine',{
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getCookie('Authorization')
    }})
    .then(response => {
      if (!response.ok && response.status === 400) {
        throw Error();
      } else {
        return response.json(); 
      }})
      .then(data => {
        var html = '';
        for (var i = 0; i < data.length; i++) {
            var advert = data[i];
            html += '<div class="advert">';
            html += '<img src="' + advert.imgLocation + '">';
            html += '<h3><a href="/advert.html?id=' + advert.advertID +'">' + advert.title + '</a></h3>';
            html += '<p>Price: $' + advert.price.toFixed(2) + '</p>';
            html += '<p>Posted by: ' + username + '</p>';
            html += '</div>';
        }
        document.getElementById('applications').innerHTML = html; // Assume you have a div with id "applications" 
    })
    .catch(error => {
        console.error('Error:', error);
    });
}