// script.js

function validateForm() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (username == "" || password == "") {
        alert("Kullanıcı adı ve şifre boş olamaz!");
        return false;  // Formun gönderilmesini engelle
    }
    return true;  // Form gönderilebilir
}

// Elemanları seç
// const profileBtn = document.getElementById('profile-btn');
// const closeBtn = document.getElementById('close-sidebar');
// const sidebar = document.getElementById('sidebar');

// // Paneli aç
// profileBtn.addEventListener('click', () => {
//     sidebar.style.width = '300px'; // Yan panel genişliği (örneğin 300px)
// });

// // Paneli kapat
// closeBtn.addEventListener('click', () => {
//     sidebar.style.width = '0'; // Paneli tekrar kapat
// });





// // İçerikleri gösterme fonksiyonu
// function showContent(contentId) {
//     // Tüm içerik bölümlerini gizle
//     const sections = document.querySelectorAll('.content-section');
//     sections.forEach(section => {
//         section.classList.remove('active');
//     });

//     // Tıklanan içeriği göster
//     const activeSection = document.getElementById(contentId);
//     activeSection.classList.add('active');
// }



// function showContent(contentId) {
//     // Tüm içerik bölümlerini gizle
//     const sections = document.querySelectorAll('.content-section');
//     sections.forEach(section => section.classList.remove('active'));

//     // Seçilen bölümü göster
//     const selectedSection = document.getElementById(contentId);
//     selectedSection.classList.add('active');

//     // Veri tabanından veri çek
//     if (contentId === 'content1') {
//         fetch('/get_profile_data')
//             .then(response => response.json())
//             .then(data => {
//                 selectedSection.innerHTML = `
//                     <h2>Profil Bilgileri</h2>
//                     <p><strong>Kullanıcı Adı:</strong> ${data.username}</p>
//                     <p><strong>İsim:</strong> ${data.firstName}</p>
//                     <p><strong>Soyisim:</strong> ${data.lastName}</p>
//                     <p><strong>Doğum Tarihi:</strong> ${data.birthDate}</p>
//                 `;
//             });
//     } else if (contentId === 'content2') {
//         fetch('/get_hedef')
//             .then(response => response.json())
//             .then(data => {
//                 let contentHTML = '<h2>Gezdiğim Yerler</h2><ul>';
//                 data.forEach(place => {
//                     contentHTML += `<li>${place.place_name} - ${place.visit_date}</li>`;
//                 });
//                 contentHTML += '</ul>';
//                 selectedSection.innerHTML = contentHTML;
//             });
//     } else if (contentId === 'content3') {
//         fetch('/get_tasks')
//             .then(response => response.json())
//             .then(data => {
//                 let contentHTML = '<h2>Gezeceğim Yerler</h2><ul>';
//                 data.forEach(place => {
//                     contentHTML += `<li>${place.place_name} - ${place.plan_date}</li>`;
//                 });
//                 contentHTML += '</ul>';
//                 selectedSection.innerHTML = contentHTML;
//             });
//     }
// }



// Ülke ve şehir dropdownlarını bağlayan fonksiyon
// document.addEventListener('DOMContentLoaded', function() {
const countryDropdown = document.getElementById('country');
const cityDropdown = document.getElementById('city');

countryDropdown.addEventListener('change', function() {
    const selectedCountry = this.value;

    // Şehir dropdown'unu filtrele
    const cityOptions = cityDropdown.querySelectorAll('option');
    cityDropdown.value = ""; // Önce şehir seçimini sıfırla

    cityOptions.forEach(option => {
        if (option.dataset.country === selectedCountry || option.value === "") {
            option.style.display = "block"; // Göster
        } else {
            option.style.display = "none"; // Gizle
        }
    });
});






document.addEventListener('DOMContentLoaded', function() {
    const countrySelect = document.getElementById('country');
    const citySelect = document.getElementById('city');
    const taskList = document.getElementById('task-list');
    const taskInput = document.getElementById('task');
    const addTaskButton = document.getElementById('add-task');
    const form = document.getElementById('trip-plan-form');

    // Ülkeleri yükleme
    fetch('/getCountries')  // Flask route'una göre '/getCountries'
        .then(response => response.json())
        .then(data => {
            data.forEach(country => {
                const option = document.createElement('option');
                option.value = country.id;
                option.textContent = country.name;
                countrySelect.appendChild(option);
            });
        });

    // Ülke seçildiğinde şehirleri yükleme
    countrySelect.addEventListener('change', function() {
        const countryId = countrySelect.value;
        fetch(`/getCities?country_id=${countryId}`)  // Flask route'una göre '/getCities'
            .then(response => response.json())
            .then(data => {
                citySelect.innerHTML = '<option value="">Şehir Seçin</option>'; // Mevcut şehirleri temizle
                data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            });
    });

    // Görev ekleme
    addTaskButton.addEventListener('click', function() {
        const taskText = taskInput.value;
        if (taskText) {
            const listItem = document.createElement('li');
            listItem.textContent = taskText;
            taskList.appendChild(listItem);
            taskInput.value = ''; // Görev kutusunu temizle
        }
    });

    // Formu gönderme
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Sayfanın yenilenmesini engelle

        const countryId = countrySelect.value;
        const cityId = citySelect.value;
        const tasks = Array.from(taskList.children).map(item => item.textContent);

        // Görevler ve seçilen şehir, ülke bilgilerini backend'e gönderme
        fetch('/savePlan', {  // Flask route'una göre '/savePlan'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                country_id: countryId,
                city_id: cityId,
                tasks: tasks
            })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message); // Backend'den gelen mesaj
        })
        .catch(error => console.error('Hata:', error));
    });
});







        // Checkbox işaretlendiğinde görevi kaydeder
function saveCheckedTasks(taskId) {
        fetch('/save_task', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: taskId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Görev kaydedildi!');
        } else {
            alert('Bir hata oluştu!');
        }
    });
}