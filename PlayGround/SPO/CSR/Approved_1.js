// Create a namespace for our functions so we don't collide with anything else
var jakobSample = jakobSample || {};

// Create a function for customizing the Field Rendering of our fields
jakobSample.CustomizeFieldRendering = function () {
    var fieldJsLinkOverride = {};
    fieldJsLinkOverride.Templates = {};

    console.log('In CustomizeFieldRendering');

    fieldJsLinkOverride.Templates.Fields =
    {
        '_ModerationStatus': { 'View': jakobSample.GetStatusFieldColor }
    };

    // Register the rendering template
    SPClientTemplates.TemplateManager.RegisterTemplateOverrides(fieldJsLinkOverride);
};

// Create a function for getting the Status Field Icon value (called from the first method)
jakobSample.GetStatusFieldColor = function (ctx) {
    var status = ctx.CurrentItem._ModerationStatus;

    console.log(ctx.CurrentItem);

    console.log('In GetStatusFieldColor');

    console.log(status);

    if (status !== 'Approved') {
        return "<div style='background-color: #FFB5B5; width: 100%; display: block; border: 2px solid #DE0000; padding-left: 2px;'><a href=javascript:jakobSample.UpdateListItem(" + ctx.CurrentItem.ID + ")>Update</a>" + status + "</div>";
    }

    return status;
};

jakobSample.MarkRowColor = function () {
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

function onQuerySucceeded() {

    alert('Item updated!');
}

function onQueryFailed(sender, args) {

    alert('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
}

jakobSample.UpdateListItem = function (itemId) {
    var siteUrl = '/sites/MySiteCollection';

    var clientContext = new SP.ClientContext(siteUrl);
    var oList = clientContext.get_web().get_lists().getByTitle('Announcements');

    this.oListItem = oList.getItemById(3);

    oListItem.set_item('Title', 'My Updated Title');

    oListItem.update();

    clientContext.executeQueryAsync(Function.createDelegate(this, this.onQuerySucceeded), Function.createDelegate(this, this.onQueryFailed));
}


jakobSample.CustomizeFieldRendering();
jakobSample.MarkRowColor();

