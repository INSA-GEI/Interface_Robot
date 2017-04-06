function vueTargetDeconnect() // Vue deconnecté 
{
    $('#target').css('width','300px');
    $('#target').css('height','300px');
    $('#target').css('margin-top','200px');
    $('#video-side').hide();
    $('#console-side').hide();
    $('#battery').hide();
    $('#dumber').hide();
    $('#fleches').hide();
}


function vueTargetConnect()
{
    $('#target').css('width','120px');  
    $('#target').css('margin-top','auto');
    $('#video-side').show();
    $('#dumber').show();
    $('#target').css('height','120px');
    $('#battery').hide();
    $('#fleches').hide();
    $('#console-side').hide();

}

function vueRobotConnect()
{
    $('#battery').show();
    $('#fleches').show();
    $('#console-side').show();

}