import adsk.core, traceback
import adsk.fusion

from xml.etree import ElementTree
from xml.etree.ElementTree import SubElement

from os.path import expanduser
import os
import tempfile
import subprocess
import urllib.request
import json

# Global Variable to handle command events
handlers = []

# Global Program ID for settings
programID = 'MyCNC_Fusion'

def get_folder():
    # Get user's home directory
    home = expanduser("~")

    # Create a subdirectory for this application settings
    home += '/' + programID + '/'

    # Create the folder if it does not exist
    if not os.path.exists(home):
        os.makedirs(home)

    return home

def getFileName():
    home = get_folder()
    
    # Get full path for the settings file
    xmlFileName = home  + 'settings.xml'
    return xmlFileName

def writeSettings(xmlFileName, mycnc_path, mycnc_ip, mycnc_post, showOperations, sendMethod):
    if not os.path.isfile(xmlFileName):
        # Create the file
        new_file = open( xmlFileName, 'w' )                        
        new_file.write( '<?xml version="1.0"?>' )
        new_file.write( '<' + programID + ' /> ')
        new_file.close()
        
        tree = ElementTree.parse(xmlFileName) 
        root = tree.getroot()
    else:
        tree = ElementTree.parse(xmlFileName) 
        root = tree.getroot()
        
        # Remove old settings info
        settingsNode = root.find('settings')
        if settingsNode is not None:
            root.remove(settingsNode)
    
    # Write settings info into XML file
    settings = SubElement(root, 'settings')
    SubElement(settings, 'mycnc_path', value = mycnc_path)
    SubElement(settings, 'mycnc_ip', value = mycnc_ip if mycnc_ip else "")
    SubElement(settings, 'mycnc_post', value = mycnc_post)
    SubElement(settings, 'showOperations', value = showOperations)
    SubElement(settings, 'sendMethod', value = sendMethod)

    tree.write(xmlFileName)

def readSettings(xmlFileName):
    tree = ElementTree.parse(xmlFileName) 
    root = tree.getroot()

    mycnc_path = root.find('settings/mycnc_path').attrib[ 'value' ]
    mycnc_post = root.find('settings/mycnc_post').attrib[ 'value' ]
    showOperations = root.find('settings/showOperations').attrib[ 'value' ]

    mycnc_ip = ""
    mycnc_ip_node = root.find('settings/mycnc_ip')
    if mycnc_ip_node is not None:
        mycnc_ip = mycnc_ip_node.attrib['value']
        
    sendMethod = "Local Application"
    sendMethod_node = root.find('settings/sendMethod')
    if sendMethod_node is not None:
        sendMethod = sendMethod_node.attrib['value']

    return(mycnc_path, mycnc_ip, mycnc_post, showOperations, sendMethod)

def exportFile(opName, mycnc_path, mycnc_ip, mycnc_post, sendMethod):
    app = adsk.core.Application.get()
    doc = app.activeDocument
    products = doc.products
    product = products.itemByProductType('CAMProductType')
    cam = adsk.cam.CAM.cast(product)

    toPost = None
    for setup in cam.setups:
        if setup.name == opName:
            toPost = setup
   
    for operation in cam.allOperations:
        if operation.name == opName:
            toPost = operation
            
    if not opName:
        app.userInterface.messageBox('No Setup or Operation was selected.')
        return None

    if not toPost:
        app.userInterface.messageBox(f'Could not find operation {opName}')
        return None

    outputFolder = get_folder() + "//output/"
    if not os.path.exists(outputFolder):
        os.makedirs(outputFolder)
    
    postConfig = os.path.join(cam.genericPostFolder, mycnc_post) 
    units = adsk.cam.PostOutputUnitOptions.DocumentUnitsOutput

    postInput = adsk.cam.PostProcessInput.create(opName, postConfig, outputFolder, units)
    postInput.isOpenInEditor = False
    cam.postProcess(toPost, postInput)
    
    resultFilename = os.path.join(outputFolder, opName + '.nc')

    url = mycnc_ip if mycnc_ip.startswith("http") else "http://" + mycnc_ip
    if not url.endswith("/api/upload"):
        if url.endswith("/"):
            url += "api/upload"
        else:
            url += "/api/upload"

    try:
        with open(resultFilename, "r") as f:
            content = f.read()
        
        data = json.dumps({"name": opName + ".nc", "content": content}).encode('utf-8')
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
        
        res = urllib.request.urlopen(req, timeout=5)
        app.userInterface.messageBox('Gcode successfully sent to remote MyCNC instance.')
    except Exception as e:
        app.userInterface.messageBox('Failed to send to remote MyCNC:\n{}'.format(str(e)))
   
    return resultFilename

def getInputs(inputs):
        mycnc_ip = inputs.itemById('mycnc_ip').value
        mycnc_post = inputs.itemById('mycnc_post').value
        
        saveSettings = inputs.itemById('saveSettings').value
        showOperationsInput = inputs.itemById('showOperations')
        showOperations = showOperationsInput.selectedItem.name
        
        setupName = ""
        setupInput = inputs.itemById('setups')
        setupItem = setupInput.selectedItem
        if setupItem:
            setupName = setupItem.name
        
        operationName = ""
        operationInput = inputs.itemById('operations')
        operationItem = operationInput.selectedItem
        if operationItem:
            operationName = operationItem.name
        
        if (showOperations == 'Setups'):
            opName = setupName
        elif (showOperations == 'Operations'):
            opName = operationName

        return (opName, mycnc_ip, mycnc_post, saveSettings, showOperations)

def setDropdown(inputs, showOperations):
    setupInput = inputs.itemById('setups')
    operationInput = inputs.itemById('operations')
    showOperationsInput = inputs.itemById('showOperations')

    if (showOperations == 'Setups'):
        setupInput.isVisible = True
        operationInput.isVisible = False
        showOperationsInput.listItems[0].isSelected = True
    elif (showOperations == 'Operations'):
        setupInput.isVisible = False
        operationInput.isVisible = True
        showOperationsInput.listItems[1].isSelected = True
    return

class MyCNCExecutedEventHandler(adsk.core.CommandEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args):
        try:
            inputs = args.command.commandInputs
            (opName, mycnc_ip, mycnc_post, saveSettings, showOperations) = getInputs(inputs)
            
            if saveSettings:
                xmlFileName = getFileName()
                writeSettings(xmlFileName, "", mycnc_ip, mycnc_post, showOperations, "Remote TCP/IP")
            
            exportFile(opName, "", mycnc_ip, mycnc_post, "Remote TCP/IP")
            
        except:
            app = adsk.core.Application.get()
            ui  = app.userInterface
            if ui:
                ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

class MyCNCInputChangedHandler(adsk.core.InputChangedEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args):
        try:
            input_changed = args.input
            inputs = args.inputs

            if input_changed.id == 'showOperations':
                showOperations = input_changed.selectedItem.name
                setDropdown(inputs, showOperations)
                
        except:
            app = adsk.core.Application.get()
            ui  = app.userInterface
            if ui:
                ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

class MyCNCCreatedEventHandler(adsk.core.CommandCreatedEventHandler):
    def __init__(self):
        super().__init__()
    def notify(self, args):
        ui = []
        try:
            app = adsk.core.Application.get()
            ui  = app.userInterface
            doc = app.activeDocument
            products = doc.products
            product = products.itemByProductType('CAMProductType')
            
            if product == None:
                 ui.messageBox('There are no CAM operations in the active document')
                 return            
            cam = adsk.cam.CAM.cast(product)

            cmd = args.command
            cmd.isExecutedWhenPreEmpted = False           
            
            onExecute = MyCNCExecutedEventHandler()
            cmd.execute.add(onExecute)
            handlers.append(onExecute)
            
            onInputChanged = MyCNCInputChangedHandler()
            cmd.inputChanged.add(onInputChanged)
            handlers.append(onInputChanged)

            inputs = cmd.commandInputs
            
            inputs.addTextBoxCommandInput('labelText2', '', '<b>MyCNC Gcode Sender</b> - Send operations straight to your device.', 2, True)
            inputs.addTextBoxCommandInput('labelText3', '', 'Choose the Setup or Operation to send to MyCNC', 2, True)

            mycnc_ip_input = inputs.addStringValueInput('mycnc_ip', 'MyCNC IP/URL: ', '127.0.0.1:8080')
            mycnc_post_input = inputs.addStringValueInput('mycnc_post', 'Post configurator: ', 'grbl.cps')
            
            showOperations_input = inputs.addRadioButtonGroupCommandInput("showOperations", 'What to Post?')  
            radioButtonItems = showOperations_input.listItems
            radioButtonItems.add("Setups", False)
            radioButtonItems.add("Operations", True)

            setupDropDown = inputs.addDropDownCommandInput('setups', 'Select Setup:', adsk.core.DropDownStyles.LabeledIconDropDownStyle)
            opDropDown = inputs.addDropDownCommandInput('operations', 'Select Operation:', adsk.core.DropDownStyles.LabeledIconDropDownStyle)
        
            for setup in cam.setups:
                setupDropDown.listItems.add(setup.name, False)
            for operation in cam.allOperations:
                opDropDown.listItems.add(operation.name, False)
                
            inputs.addBoolValueInput("saveSettings", 'Save settings?', True)
            
            cmd.commandCategoryName = 'MyCNC'
            cmd.setDialogInitialSize(500, 300)
            cmd.setDialogMinimumSize(500, 300)
            cmd.okButtonText = 'Send to MyCNC'  
            
            xmlFileName = getFileName()
            if os.path.isfile(xmlFileName):
                try:
                    (_, mycnc_ip, mycnc_post, showOperations, _) = readSettings(xmlFileName)
                    mycnc_ip_input.value = mycnc_ip
                    mycnc_post_input.value = mycnc_post
                        
                    setDropdown(inputs, showOperations)
                except Exception as e:
                    setDropdown(inputs, 'Operations')
                    mycnc_post_input.value = 'grbl.cps'
            else:
                setDropdown(inputs, 'Operations')
                mycnc_post_input.value = 'grbl.cps'

        except:
            if ui:
                ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

def run(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface

        if ui.commandDefinitions.itemById('MyCNCButtonID'):
            ui.commandDefinitions.itemById('MyCNCButtonID').deleteMe()

        cmdDefs = ui.commandDefinitions

        tooltip = 'Send Gcode to MyCNC Application'
        MyCNCButtonDef = cmdDefs.addButtonDefinition('MyCNCButtonID', 'Send to MyCNC', tooltip, './/Resources')
        onMyCNCCreated = MyCNCCreatedEventHandler()
        MyCNCButtonDef.commandCreated.add(onMyCNCCreated)
        handlers.append(onMyCNCCreated)

        solidPanel = ui.allToolbarPanels.itemById('CAMActionPanel')
        solidPanel.controls.addCommand(MyCNCButtonDef, '', False)
    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))

def stop(context):
    ui = None
    try:
        app = adsk.core.Application.get()
        ui  = app.userInterface

        if ui.commandDefinitions.itemById('MyCNCButtonID'):
            ui.commandDefinitions.itemById('MyCNCButtonID').deleteMe()

        camPanel = ui.allToolbarPanels.itemById('CAMActionPanel')
        cntrl = camPanel.controls.itemById('MyCNCButtonID')
        if cntrl:
            cntrl.deleteMe()

    except:
        if ui:
            ui.messageBox('Failed:\n{}'.format(traceback.format_exc()))
