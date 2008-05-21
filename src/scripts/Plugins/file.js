/** * Copyright (c) 2006 * Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner * * Permission is hereby granted, free of charge, to any person obtaining a * copy of this software and associated documentation files (the "Software"), * to deal in the Software without restriction, including without limitation * the rights to use, copy, modify, merge, publish, distribute, sublicense, * and/or sell copies of the Software, and to permit persons to whom the * Software is furnished to do so, subject to the following conditions: * * The above copyright notice and this permission notice shall be included in * all copies or substantial portions of the Software. * * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER * DEALINGS IN THE SOFTWARE. **/if (!ORYX.Plugins)     ORYX.Plugins = new Object();ORYX.Plugins.File = Clazz.extend({    facade: undefined,	processURI: undefined,        construct: function(facade){        this.facade = facade;                this.facade.offer({            'name': "Save",            'functionality': this.save.bind(this),            'group': "File",            'icon': ORYX.PATH + "images/disk.png",            'description': "Save",            'index': 1,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': "Print",            'functionality': this.print.bind(this),            'group': "File",            'icon': ORYX.PATH + "images/printer.png",            'description': "Print current modell",            'index': 2,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': "Print",            'functionality': this.exportPDF.bind(this),            'group': "File",            'icon': ORYX.PATH + "images/page_white_acrobat.png",            'description': "Export as PDF",            'index': 3,            'minShape': 0,            'maxShape': 0        });                this.facade.offer({            'name': "Info",            'functionality': this.info.bind(this),            'group': "File",            'icon': ORYX.PATH + "images/information.png",            'description': "Info",            'index': 4,            'minShape': 0,            'maxShape': 0        });				      		window.onbeforeunload = this.onUnLoad.bind(this)		this.serializedDOM = DataManager.__persistDOM(this.facade);    },    	onUnLoad: function(){				if( this.serializedDOM != DataManager.__persistDOM(this.facade) ){					return "There are unsaved data, please save before you leave, otherwise your changes get lost!";					}						},	    saveSynchronously: function(){            //var resource = location.search.split("resource=");        		//Commented out because with Oles new server, this if check is true,		// so it won't work.		/*        if (resource.length == 1) {	            // SAVE the DOM with ARESS-SERVER	            DataManager.__syncglobal(this.facade);		                    } else { */            // SAVE the DOM with ORYX-SERVER            //resource = resource[1].split("&")[0];            		// Get the serialized dom		this.serializedDOM = DataManager.__persistDOM(this.facade);		var reqURI = this.processURI ? this.processURI : location.href;		// Get the serialized svg image source        var svgClone = this.facade.getCanvas().getRootNode().cloneNode(true);        // Set the width and height        svgClone.setAttributeNS(null, 'width', 2800);        svgClone.setAttributeNS(null, 'height', 2200);		try{			var svgCont = svgClone.childNodes[1].childNodes[1];			svgCont.parentNode.removeChild(svgCont);		} catch(e) {}        var svgDOM = DataManager.serialize(svgClone);            		// Send the request to the server.		new Ajax.Request(reqURI, {                method: 'POST',                asynchronous: false,                parameters: {                    //resource: resource,				data: this.serializedDOM,				svg: svgDOM			},			onSuccess: (function(transport) {				var loc = transport.getResponseHeader("location");				if (!this.processURI && loc) {					this.processURI = loc;				}				//show saved status				this.facade.raiseEvent({						type:'loading.status',						text:'Saved!'					});			}).bind(this),			onFailure: function(transport) {				// raise loading disable event.                this.facade.raiseEvent({                    type: 'loading.disable'                });			alert("Saving failed.");						ORYX.log.warn("Saving failed: " + transport.responseText);		}});                    //}    },        /**     * Saves the current process to the server.     * @param {Object} saveSynchronously when true, this call is synchronous and     * waits for server reply. In this case, this call doesn't raise events for     * loading plugin. If false, this will raise loading events and save     * asynchronously. Use latter if UI responsibility is wanted, Former when     * you need to be certain that saving is finished.     */    save: function(event, synchronously){            // if not to saved synchronously        if (synchronously == undefined) {                    // raise loading enable event            this.facade.raiseEvent({                type: 'loading.enable',				text: 'Saving'            });                        // asynchronously ...            window.setTimeout((function(){                            // ... save synchronously                this.saveSynchronously();                            }).bind(this), 10);                    }        else                     // just save, synchronously.            this.saveSynchronously();                return true;    },        info: function(){            //TODO Make this fit in 80 columns.        var info = "Copyright (c) 2006\n" +        "Martin Czuchra, Nicolas Peters, Daniel Polak, Willi Tscheschner\n\n" +        "Permission is hereby granted, free of charge, to any person " +        "obtaining a copy of this software and associated documentation files " +        "(the Software), to deal in the Software without restriction, " +        "including without limitation the rights to use, copy, modify, merge, " +        "publish, distribute, sublicense, and/or sell copies of the Software, " +        "and to permit persons to whom the Software is furnished to do so, " +        "subject to the following conditions:\n\n" +        "The above copyright notice and this permission notice shall be " +        "included in all copies or substantial portions of the Software.\n\n" +        "THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, " +        "EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF " +        "MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND " +        "NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS " +        "BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN " +        "ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN " +        "CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE " +        "SOFTWARE.";                alert(info);        return false;    },        exportPDF: function(){            var resource = location.href;                // Get the serialized svg image source        var svgClone = this.facade.getCanvas().getRootNode().cloneNode(true);		        // Set the width and height        svgClone.setAttributeNS(null, 'width', 2800);        svgClone.setAttributeNS(null, 'height', 2200);                var svgDOM = DataManager.serialize(svgClone);                // Send the svg to the server.        //TODO make this better by using content negotiation instead of format parameter.        //TODO make this better by generating svg on the server, too.        new Ajax.Request(ORYX.CONFIG.PDF_EXPORT_URL, {            method: 'POST',            parameters: {                resource: resource,                data: svgDOM,                format: "pdf"            },            onSuccess: function(request){                            // Because the pdf may be opened in the same window as the                // process, yet the process may not have been saved, we're                // opening every other representation in a new window.                // location.href = request.responseText                window.open(request.responseText);            }        });    },        print: function(){            // Set all options for the new window        var option = $H({            width: 300,            height: 400,            toolbar: "no",            status: "no",            menubar: "yes",            dependent: "yes",            resizable: "yes",            scrollbars: "yes"        });                // Create the new window with all the settings        var newWindow = window.open("", "PrintWindow", option.invoke('join', '=').join(','));                // Add a style tag to the head and hide all controls        var head = newWindow.document.getElementsByTagName('head')[0];        var style = document.createElement("style");        style.innerHTML = " body {padding:0px; margin:0px} .svgcontainer { display:none; }";        head.appendChild(style);                // Clone the svg-node and append this to the new body        newWindow.document.getElementsByTagName('body')[0].appendChild(this.facade.getCanvas().getRootNode().cloneNode(true));        var svg = newWindow.document.getElementsByTagName('body')[0].getElementsByTagName('svg')[0];                // Set the width and height        svg.setAttributeNS(null, 'width', 1100);        svg.setAttributeNS(null, 'height', 1400);                // Set the correct size and rotation        svg.lastChild.setAttributeNS(null, 'transform', 'scale(0.47, 0.47) rotate(270, 1510, 1470)');                var markers = ['marker-start', 'marker-mid', 'marker-end']        var path = $A(newWindow.document.getElementsByTagName('path'));        path.each(function(pathNode){            markers.each(function(marker){                // Get the marker value                var url = pathNode.getAttributeNS(null, marker);                if (!url) {                    return                };                                // Replace the URL and set them new                url = "url(about:blank#" + url.slice(5);                pathNode.setAttributeNS(null, marker, url);            });        });                // Get the print dialog        newWindow.print();                return true;    }    });