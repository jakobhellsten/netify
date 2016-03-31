// Create a namespace for our functions so we don't collide with anything else
var renderModerationStatus = renderModerationStatus || {};

// Create a function for customizing the Field Rendering of our fields
renderModerationStatus.CustomizeFieldRendering = function () {
    var fieldJsLinkOverride = {};
    fieldJsLinkOverride.Templates = {};

    console.log('In CustomizeFieldRendering');

    fieldJsLinkOverride.Templates.Fields =
    {
        '_ModerationStatus': { 'View': renderModerationStatus.GetStatusFieldColor }
    };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(fieldJsLinkOverride);
};

// Create a function for getting the Status Field value (called from the first method)
renderModerationStatus.GetStatusFieldColor = function (ctx) {
    var status = ctx.CurrentItem._ModerationStatus;

    console.log(ctx.CurrentItem);

    console.log('In GetStatusFieldColor');

    console.log(status);

    if (status !== 'Approved') {
        //return "<div style='background-color: #FFB5B5; width: 100%; display: block; border: 2px solid #DE0000; padding-left: 2px;'><a href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 0)'>Publicera</a></div>";
        return "<div style='background-color: #ada; text-align:center; border-radius: 25px; width: 100%; display: block; border: 2px solid green; text-align:center; margin-bottom: 2px'><a class='ms-cellstyle ms-vb2' href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 0)')>Publicera</a></div><div style='background-color: #FFB5B5; width: 100%; border-radius: 25px; display: block; border: 2px solid red; text-align:center;'><a class='ms-cellstyle ms-vb2' href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 1)'>Avpublicera</a></div>";
    }
    else if (status === 'Approved') {
        return "<div style='background-color: #FFB5B5; width: 100%; border-radius: 25px; display: block; border: 2px solid red; text-align:center;'><a class='ms-cellstyle ms-vb2' href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 1)'>Avpublicera</a></div>";
    }

    return status;
};

renderModerationStatus.MarkRowColor = function () {
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
        OnPostRender: function (ctx) {
            console.log('in OnPostRender')
            var rows = ctx.ListData.Row;
            for (var i = 0; i < rows.length; i++) {
                var isApproved = rows[i]["_ModerationStatus"] == "Approved";
                if (isApproved) {
                    var rowElementId = GenerateIIDForListItem(ctx, rows[i]);
                    var tr = document.getElementById(rowElementId);
                    tr.style.backgroundColor = "#ada";
                }
            }
        }
    });
}

renderModerationStatus.onQuerySucceeded = function () {

    console.log('Item updated!');
    location.reload();
}

renderModerationStatus.onQueryFailed = function(sender, args) {

    console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

renderModerationStatus.UpdateListItem = function (itemId, status) {
    var siteUrl = '/TestSite';

    var clientContext = new SP.ClientContext(siteUrl);
    var oList = clientContext.get_web().get_lists().getByTitle('SwCGTest');

    var oListItem = oList.getItemById(itemId);

    oListItem.set_item('_ModerationStatus', status)

    oListItem.update();

    clientContext.executeQueryAsync(renderModerationStatus.onQuerySucceeded, renderModerationStatus.onQueryFailed);
}


renderModerationStatus.CustomizeFieldRendering();
renderModerationStatus.MarkRowColor();

