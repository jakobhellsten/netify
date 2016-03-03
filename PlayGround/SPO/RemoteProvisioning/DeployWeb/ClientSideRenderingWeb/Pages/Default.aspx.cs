using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.SharePoint.Client;
using System.IO;

namespace ClientSideRenderingWeb
{
    public partial class Default : System.Web.UI.Page
    {
        protected void Page_PreInit(object sender, EventArgs e)
        {
            Uri redirectUrl;
            switch (SharePointContextProvider.CheckRedirectionStatus(Context, out redirectUrl))
            {
                case RedirectionStatus.Ok:
                    return;
                case RedirectionStatus.ShouldRedirect:
                    Response.Redirect(redirectUrl.AbsoluteUri, endResponse: true);
                    break;
                case RedirectionStatus.CanNotRedirect:
                    Response.Write("An error occurred while processing your request.");
                    Response.End();
                    break;
            }
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            // The following code gets the client context and Title property by using TokenHelper.
            // To access other properties, the app may need to request permissions on the host web.
            var spContext = SharePointContextProvider.Current.GetSharePointContext(Context);

            using (var clientContext = spContext.CreateUserClientContextForSPHost())
            {
                clientContext.Load(clientContext.Web, web => web.Title);
                clientContext.ExecuteQuery();
                Response.Write(clientContext.Web.Title);
            }
        }

        protected void btnCreateWebAndJsFiles_Click(object sender, EventArgs e)
        {
            var spContext = SharePointContextProvider.Current.GetSharePointContext(Context);

            using (var clientContext = spContext.CreateUserClientContextForSPHost())
            {
                clientContext.Load(clientContext.Web, web => web.Title);
                clientContext.ExecuteQuery();
                UploadJSFiles(clientContext.Web);
            }
        }

        void UploadJSFiles(Web web)
        {
            //Delete the folder if it exists
            Microsoft.SharePoint.Client.List list = web.Lists.GetByTitle("Style Library");
            IEnumerable<Folder> results = web.Context.LoadQuery<Folder>(list.RootFolder.Folders.Where(folder => folder.Name == "CSR-Sample"));
            web.Context.ExecuteQuery();
            Folder samplesJSfolder = results.FirstOrDefault();

            if (samplesJSfolder != null)
            {
                samplesJSfolder.DeleteObject();
                web.Context.ExecuteQuery();
            }

            samplesJSfolder = list.RootFolder.Folders.Add("CSR-JsLink");
            web.Context.Load(samplesJSfolder);
            web.Context.ExecuteQuery();

            UploadFileToFolder(web, Server.MapPath("../Scripts/CSR-JsLink/MarkROw.js"), samplesJSfolder);

            Folder imgsFolder = samplesJSfolder.Folders.Add("imgs");
            web.Context.Load(imgsFolder);
            web.Context.ExecuteQuery();

            UploadFileToFolder(web, Server.MapPath("../Scripts/CSR-JsLink/imgs/Confidential.png"), imgsFolder);
        }

        public static void UploadFileToFolder(Web web, string filePath, Folder folder)
        {
            using (FileStream fs = new FileStream(filePath, FileMode.Open))
            {
                FileCreationInformation flciNewFile = new FileCreationInformation();

                flciNewFile.ContentStream = fs;
                flciNewFile.Url = System.IO.Path.GetFileName(filePath);
                flciNewFile.Overwrite = true;

                Microsoft.SharePoint.Client.File uploadFile = folder.Files.Add(flciNewFile);
                uploadFile.CheckIn("CSR test", CheckinType.MajorCheckIn);

                folder.Context.Load(uploadFile);
                folder.Context.ExecuteQuery();
            }
        }

        void ProvisionSample(Web web)
        {
            //Delete list if it already exists
            ListCollection lists = web.Lists;
            IEnumerable<List> results = web.Context.LoadQuery<List>(lists.Where(list => list.Title == "CSR-Confidential-Documents"));
            web.Context.ExecuteQuery();
            List existingList = results.FirstOrDefault();

            if (existingList != null)
            {
                existingList.DeleteObject();
                web.Context.ExecuteQuery();
            }

            //Create list
            ListCreationInformation creationInfo = new ListCreationInformation();
            creationInfo.Title = "CSR-Confidential-Documents";
            creationInfo.TemplateType = (int)ListTemplateType.DocumentLibrary;
            List newlist = web.Lists.Add(creationInfo);
            newlist.Update();
            web.Context.Load(newlist);
            web.Context.Load(newlist.Fields);
            web.Context.ExecuteQuery();

            //Add field
            FieldCollection fields = web.Fields;
            web.Context.Load(fields, fc => fc.Include(f => f.InternalName));
            web.Context.ExecuteQuery();
            Field field = fields.FirstOrDefault(f => f.InternalName == "Confidential");
            if (field == null)
            {
                field = newlist.Fields.AddFieldAsXml("<Field Type=\"YES/NO\" Name=\"Confidential\" DisplayName=\"Confidential\" ID=\"" + Guid.NewGuid() + "\" Group=\"CSR Samples\" />", false, AddFieldOptions.DefaultValue);
                web.Update();
                web.Context.ExecuteQuery();
            }
            newlist.Fields.Add(field);
            newlist.Update();
            web.Context.ExecuteQuery();

            //Upload sample docs
            //UploadTempDoc(newlist, "Doc1.doc");
            //UploadTempDoc(newlist, "Doc2.doc");
            //UploadTempDoc(newlist, "Doc3.ppt");
            //UploadTempDoc(newlist, "Doc4.ppt");
            //UploadTempDoc(newlist, "Doc5.xls");
            //UploadTempDoc(newlist, "Doc6.xls");
            Microsoft.SharePoint.Client.ListItem item1 = newlist.GetItemById(1);
            item1["Confidential"] = 1;
            item1.Update();
            Microsoft.SharePoint.Client.ListItem item2 = newlist.GetItemById(2);
            item2["Confidential"] = 1;
            item2.Update();
            Microsoft.SharePoint.Client.ListItem item3 = newlist.GetItemById(3);
            item3["Confidential"] = 0;
            item3.Update();
            Microsoft.SharePoint.Client.ListItem item4 = newlist.GetItemById(4);
            item4["Confidential"] = 1;
            item4.Update();
            Microsoft.SharePoint.Client.ListItem item5 = newlist.GetItemById(5);
            item5["Confidential"] = 0;
            item5.Update();
            Microsoft.SharePoint.Client.ListItem item6 = newlist.GetItemById(6);
            item6["Confidential"] = 1;
            item6.Update();
            web.Context.ExecuteQuery();

            //Create sample view
            ViewCreationInformation sampleViewCreateInfo = new ViewCreationInformation();
            sampleViewCreateInfo.Title = "CSR Sample View";
            sampleViewCreateInfo.ViewFields = new string[] { "DocIcon", "LinkFilename", "Modified", "Editor", "Confidential" };
            sampleViewCreateInfo.SetAsDefaultView = true;
            Microsoft.SharePoint.Client.View sampleView = newlist.Views.Add(sampleViewCreateInfo);
            sampleView.Update();
            web.Context.Load(newlist, l => l.DefaultViewUrl);
            web.Context.ExecuteQuery();

            //Register JS files via JSLink properties
            RegisterJStoWebPart(web, newlist.DefaultViewUrl, "~sitecollection/Style Library/JSLink-Samples/ConfidentialDocuments.js");
        }
    }


}