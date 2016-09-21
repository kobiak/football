$(document).ready(function () {

    $('body').css('padding-top',$('header').outerHeight());
    $('.second-nav a').on('click touch', function(e){
        e.preventDefault();
        $('.second-nav a').parent().removeClass('active');
        $(this).parent().addClass('active');
    });
    /* var runScript = true;    

     //function getCookie        
     function getCookie(cname) {
         var name = cname + "=";
         var ca = document.cookie.split(';');
         for (var i = 0; i < ca.length; i++) {
             var c = ca[i];
             while (c.charAt(0) == ' ') c = c.substring(1);
             if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
         }
         return "";
     };

     //get cookie 
     var cookiename = getCookie("updated");
     if (cookiename == "true") {
         runScript = false
     };*/

    function buildTable() {
        // clear table
        $('.table').html('');

        // retrive response from localstorage
        var appData = JSON.parse(localStorage.getItem('EPL'));

        // update league name           
        $('.league-name').html(appData.leagueCaption);

        // build league table
        $.each(appData.standing, function (index) {
            var name = appData.standing[index].teamName,
                logo = appData.standing[index].crestURI,
                gamesPlayed = appData.standing[index].playedGames,
                gamesWin = appData.standing[index].wins,
                gamesLost = appData.standing[index].losses,
                gamesDraw = appData.standing[index].draws,
                totalPoints = appData.standing[index].points,
                goalDifference = appData.standing[index].goalDifference;

            $('.table').append('<div class="row"><div class="logo"><img src="' + logo + '"></div><div class="team-name">' + name + '</div><div>' + gamesPlayed + '</div><div>' + gamesWin + '</div><div>' + gamesDraw + '</div><div>' + gamesLost + '</div><div>' + goalDifference + '</div><div>' + totalPoints + '</div></div>');

        });
    };

    function runAjaxCall() {
        $.ajax({
            headers: {
                'X-Auth-Token': 'ad36d94a3eaf4dcf802b05c867b5e9e6'
            },
            url: 'http://api.football-data.org/v1/competitions/426/leagueTable',
            dataType: 'json',
            type: 'GET',
            success: function (response) {
                // save response to localstorage
                var appData = JSON.stringify(response);
                localStorage.setItem('EPL', appData);               

                console.log('use ajax');

                buildTable();
            },
            beforeSend: function () {

                $('.table-data').addClass('overlay');
                $('.table-data').append('<div class="overlay-box"><div class="loader"><svg viewBox="0 0 32 32" width="32" height="32"><circle id="spinner" cx="16" cy="16" r="14" fill="none"></circle></svg></div></div>')

            },
            complete: function () {

                $('.table-data').removeClass('overlay');
                $('.overlay-box').remove();

            },
            error: function () {
                console.error('error ajax call');
            }

        });
    };

    if (localStorage.getItem('EPL') !== null) {      

        console.log('use localstorage');

        buildTable();

    } else {
        runAjaxCall();
    };

    $('.update-table').on('click touch', function (e) {
        e.preventDefault();
        runAjaxCall();
    });

    /* if ('serviceWorker' in navigator) {
         navigator.serviceWorker
             .register('service-worker.js')
             .then(function () {
                 console.log('Service Worker Registered');
             });
     };*/
});