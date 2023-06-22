//var tempInd = document.getElementById("tempInd");
//tempInd.innerHTML = "Temperatura: 27 stopni";

//$('#tempInd').html('Temperatura: 25 stopni');
//$('#humidInd').html('Wilgotność: 40%');

getParameters();

function getParameters()
{
    $.get({
        'url': '/api/parameters',
        'success': (dataJSON)=>{
            //var data = JSON.parse(dataJSON);
            var data = dataJSON;
            $('#tempInd').html('Temperatura: '+(data.temp)+' stopni');
            $('#humidInd').html('Wilgotność: '+(data.humid)+'%');

            setTimeout(getParameters, 500);
        }
    });

    $.get({
        'url': '/api/alarmstate',
        'success': (state)=>{
            if (state == 'on')
            {
                $('#alarmBtn').removeAttr('disabled');
            }
            else
            {
                $('#alarmBtn').attr('disabled', 'disabled');
            }
        }
    })
}

$('#alarmBtn').click(()=>{
    $.get({
        'url': '/api/alarmoff',
        'success': (data)=>{
            console.log(data);
        }
    })
})