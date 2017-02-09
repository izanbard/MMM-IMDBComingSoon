# MMM-IMDBComingSoon
The `IMDBComingSoon` module displays all the listed films in IMDBs comming Soon section for this month and next month.  It is similar to [MMM-MovieInfo](https://github.com/fewieden/MMM-MovieInfo) by [fewieden](https://github.com/fewieden), but has been rewitten to use IMDB instead of TheMovieDB and to remove the dependencies.

**It is required** that you get an API key from the API proxy site [myapifilms.com](http://www.myapifilms.com/index.do), do so is easy and free (for less than 2000 requests per day).  Simply click on "Token" in the menu bar and follow the instructions.

## Screenshot

![IMDBComingSoon](/.github/screenshot.png?raw=true)

## Installation

  1\. Execute the following commands from your `MagicMirror/modules` folder:
```bash
git clone https://github.com/izanbard/MMM-IMDBComingSoon.git # clone this repository
```
  2\. Add the module to your `config/config.js` file (see below for details).

## Using the module

To use this module you will need a [myapifilms.com](http://www.myapifilms.com/index.do) API Key.

Get your required API Key from [myapifilms.com/token.do](http://www.myapifilms.com/token.do).

Then, add it to the modules array in the `config/config.js` file:
````javascript
var config = {
    modules: [
        {
            module: 'MMM-IMDBComingSoon',
            position: 'top_left',
            header: "Upcoming Films",
            config: {
                apikey: "You Must Change This Value",
                reloadInterval: 8 * 60 * 60 * 1000, //8 hours
                dataSwapInterval: 60 * 1000, //1 min
                animationSpeed: 1.5 * 1000 //1.5 secs
            }
        }
    ]
}
````

## Configuration options

The following properties can be configured:


<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
	    <tr>
	        <td><code>apiKey</code></td>
	        <td>Get your required API Key from <a href="http://www.myapifilms.com/token.do">myapifilms.com/token.do</a>. 
	            <br><b>Possible Values:</b> 32 Hexdecimal Chars with additional hyphens
	            <br><b>Default Value:</b> <b>NO DEFAULT VALUE - YOU MUST GET ONE OF YOUR OWN</b>
	        </td>
	    </tr>
	    <tr>
	        <td><code>reloadInterval</code></td>
	        <td>The time (in millisecs) between API calls made to the API proxy.  If this value is setto less then 1 minute, then it is rest to exactly 1 minute.  Given that you have a max of 2000 requests per day, consider fewer reload calls. (the films won't be updated that ofeten on IMDB.
	            <br><b>Possible Values:</b> any integer greater than 60000.
	            <br><b>Default Value:</b> <code>8 * 60 * 60 * 1000</code> which is 8 hours
	        </td>
	    </tr>
	    <tr>
	        <td><code>dataSwapInterval</code></td>
	        <td>The time (in millisecs) to show each film before swapping to the next one.
	            <br><b>Possible Values:</b> any integer value
	            <br><b>Default Value:</b> <code>60 * 1000</code> which is 1 min
	        </td>
	    </tr>
	    <tr>
	        <td><code>animationSpeed</code></td>
	        <td>When swapping between fims, how fast to fade in/out (in millisecs).
	            <br><b>Possible Values:</b> any integer value
	            <br><b>Default Value:</b> <code>1.5 * 1000</code> which is 1.5 secs
	        </td>
	    </tr>
	</tbody>
</table>
	