// Create a namespace for our functions so we don't collide with anything else
var renderModerationStatus = renderModerationStatus || {};
renderModerationStatus.hasEditRights = false;

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
    var version = ctx.CurrentItem.version;

    console.log(version);
    console.log(ctx.CurrentItem);

    console.log('In GetStatusFieldColor');

    console.log(status);

    if (status !== 'Approved') {
        //return "<div style='background-color: #FFB5B5; width: 100%; display: block; border: 2px solid #DE0000; padding-left: 2px;'><a href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 0)'>Publicera</a></div>";
        return "<div style='background-color: green; text-align:center; border-radius: 25px; width: 100%; display: block; border: 2px solid green; padding-left: 2px;'><a style='text-color:black;' href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 0)')>Approve</a></div>";
    }
    else if (status === 'Approved')
    {
        return "<div style='background-color: #FFB5B5; width: 100%; border-radius: 25px; display: block; border: 2px solid red; padding-left: 2px;'><a href='javascript:renderModerationStatus.UpdateListItem(" + ctx.CurrentItem.ID + ", 1)'>Avpublicera</a></div>";
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
                    tr.style.borderRadius = "25px";
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

renderModerationStatus.CheckEditPermissionsOnWeb = function () {
    renderModerationStatus.deferred = $.Deferred();
    var context = new SP.ClientContext.get_current();
    renderModerationStatus.web = context.get_web();

    renderModerationStatus.currentUser = renderModerationStatus.web.get_currentUser();
    console.log(renderModerationStatus.currentUser);
    context.load(renderModerationStatus.currentUser);
    context.load(renderModerationStatus.web, 'EffectiveBasePermissions');
    context.executeQueryAsync(renderModerationStatus.editPermissonsOnSuccessMethod, renderModerationStatus.editPermissonsOnFailureMethod);

    return renderModerationStatus.deferred.promise();
}

renderModerationStatus.editPermissonsOnSuccessMethod = function (sender, args) {
    console.log("In onSuccess" + renderModerationStatus.web);
    //console.log(renderModerationStatus.web.get_effectiveBasePermissions());
    var permissionLevels = renderModerationStatus.web.get_effectiveBasePermissions();
    console.log(permissionLevels);

    if (permissionLevels.has(SP.PermissionKind.EditListItems)) {
        //User Has Edit Permissions

        console.log('Has edit permissions');
        
        renderModerationStatus.hasEditRights = true;
        console.log(renderModerationStatus.hasEditRights);

        renderModerationStatus.deferred.resolve()
    }    
}

renderModerationStatus.editPermissonsOnFailureMethod = function (sender, args) {
    console.log("In OnFailure" + renderModerationStatus.web);
    renderModerationStatus.hasEditRights = false;
}

renderModerationStatus.ApplyCustomization = function () {
    renderModerationStatus.CheckEditPermissionsOnWeb().then(
            function () {
                console.log(renderModerationStatus.hasEditRights + "in deferred");
                if (renderModerationStatus.hasEditRights) {
                    renderModerationStatus.CustomizeFieldRendering();
                    renderModerationStatus.MarkRowColor();
                }
            },
            function (sender, args) {
                console.log('An error occured while retrieving list items:' + args.get_message());
            }
        );
}

console.log('Before SP.SOD');

SP.SOD.executeFunc('sp.js', null, function () {
    console.log('test load sp.js');
})

SP.SOD.executeOrDelayUntilScriptLoaded(renderModerationStatus.ApplyCustomization, 'sp.js')


SP.SOD.executeFunc('sp.js', 'SP.ClientContext', function () {
    console.log('In SP.SOD');
    renderModerationStatus.ApplyCustomization;

})
console.log('After SP.SOD');







