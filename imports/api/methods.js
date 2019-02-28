import Values from './collections/values.js';

Meteor.methods({
	'changeday'(daynr){
		let output = [], g_out = [];//[-10, -3, daynr, 10, 15, 10, 14, 17, 20, 17, 16, 12, 13, 14]
		let curdaynr = moment(new Date()).format("E");
		let values, adaybefore, adayafter, daydiff = curdaynr-daynr;

		function findValues(daydiff){
			let start = moment().subtract(daydiff,'days').startOf('day').format("MMMM D, YYYY HH:mm:ss")
			let end = moment().subtract(daydiff,'days').endOf('day').format("MMMM D, YYYY HH:mm:ss")
			return Values.find({d:{
				$gte: new Date(start),
	        	$lt: new Date(end)
			}}).fetch();
		}
		values = findValues(daydiff)
		adaybefore = findValues(daydiff+1)


		output[0] = [];
		_.each(adaybefore, val=>{
			let time = moment(val.d).format("H");
			if(time >= 22 && time < 24){
				output[0].push(parseFloat(val.t))
			}
		});


		output[13] = [];
		if(daydiff>0){
			let start = moment().add(daydiff-1,'days').startOf('day').format("MMMM D, YYYY HH:mm:ss")
			let end = moment().add(daydiff-1,'days').endOf('day').format("MMMM D, YYYY HH:mm:ss")
			adayafter = Values.find({d:{
				$gte: new Date(start),
	        	$lt: new Date(end)
			}}).fetch();

			_.each(adayafter, val=>{
				let time = moment(val.d).format("H");
				if(time >= 0 && time < 2){
					output[13].push(parseFloat(val.t))
				}
			});
		}

		

		for(var i=1; i<13; i++){
			output[i] = [];
		}

		_.each(values, val=>{
			let time = moment(val.d).format("H");
			if(time >= 0 && time < 2){
				output[1].push(parseFloat(val.t))
			}else if(time >= 2 && time < 4){
				output[2].push(parseFloat(val.t))
			}else if(time >= 4 && time < 6){
				output[3].push(parseFloat(val.t))
			}else if(time >= 6 && time < 8){
				output[4].push(parseFloat(val.t))
			}else if(time >= 8 && time < 10){
				output[5].push(parseFloat(val.t))
			}else if(time >= 10 && time < 12){
				output[6].push(parseFloat(val.t))
			}else if(time >= 12 && time < 14){
				output[7].push(parseFloat(val.t))
			}else if(time >= 14 && time < 16){
				output[8].push(parseFloat(val.t))
			}else if(time >= 16 && time < 18){
				output[9].push(parseFloat(val.t))
			}else if(time >= 18 && time < 20){
				output[10].push(parseFloat(val.t))
			}else if(time >= 20 && time < 22){
				output[11].push(parseFloat(val.t))
			}else if(time >= 22 && time < 24){
				output[12].push(parseFloat(val.t))
			}
		});

		//media aritmetica
		_.each(output, out=>{
			let sum = 0;
			
			if(out.length > 0){
				for(let i=0; i<out.length; i++){
					sum += out[i];
				}
				g_out.push(sum / out.length);
			}else{
				g_out.push('');
			}
		})


		if(daydiff == 0){
			for(let i=g_out.length-1; i>0; i--){
				if(g_out[i]==[]){
					g_out.pop()
				}
			}
		}

		return g_out;
	}
});