import express, { Request, Response } from "express";


const app = express()
const port = 3000


app.use(express.json());


//TASK-1:

type User = {
    id:number,
    username:string,
    password:string,
    email:string,
    fullname:string,
    providerId?:number
}

let users:User[] = [];

app.get('/users', (req, res) => {
    res.json(users)                        
});

// Create a user with attributes username, password, email and fullname
app.post('/users', (req: Request, res: Response) => {
    const id = users.length +1;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fullname = req.body.fullname;

    const newUser = {
        "id": id,
        "username": username,
        "password": password,
        "email": email,
        "fullname": fullname

    }
    users.push(newUser);
    console.log(req.body);
    res.send('hello')
    // use req.body
});

// Return a user with parameter id if not exists return message saying `user not found`
app.get('/users/:id', (req: Request, res: Response) => {
        const id = parseInt(req.params.id);
        const user = users.find(user => user.id === id);

        if(user){
            res.json(user);

        }else{
            res.json('user not found');
        }

});


// update user information for given id 
app.put('/users/:id', (req: Request, res:Response) => {
    // req.params.id
    const id = parseInt(req.params.id);
    let user = users.find(user => user.id === id);

    if(user){
        console.log(req.body)
        console.log(user)
        user = {...user,...req.body}
        console.log(user)
        //     "id": userIndex+1,
        //     "username": username,
        //     "password": password,
        //     "email": email,
        //     "fullname": fullname
        // };
        // users[userIndex] = updatedUser;
        res.send(user)
    }
    else{
        res.json("user not found");
    }

});


// delete user for given id
app.delete('/users/:id', (req: Request, res: Response) => {

    const id = parseInt(req.params.id);
    const { username, password, email, fullname} = req.body;

    const userIndex =  users.findIndex(user => user.id === id);
    if(userIndex !== -1){
        users.splice(userIndex, 1);
        res.json("user deleted successfully");

    }else{
        res.json("user not found");
    }
    // req.params.id
});






//TASK-2:

type Provider = {
    id: number;
    name: string;
    charge: number;
};

let providers: Provider[] = [];


app.get('/providers', (req, res) => {
    res.json(providers)
});

app.post('/providers', (req: Request, res: Response) => {
    const id = providers.length +1;
    const name = req.body.name;
    const charge = req.body.charge;

    const newProvider =  {
        "id": id,
        "name": name,
        "charge": charge
    }
    providers.push(newProvider);
    console.log(req.body);
    res.send('provider created')
    // use req.body
});

app.get('/providers/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const provider = providers.find(provider => provider.id === id);

    if(provider){
        res.json(provider);

    }else{
        res.json('user not found');
    }

});

app.delete('/providers/:id', (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    providers = providers.filter(provider => provider.id !== id);
    res.json( 'Provider deleted' );
});


//TASK-3:

app.post('/users/:userId/subscribe', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const providerId = req.body.providerId;

    const user = users.find(user => user.id === userId);
    const provider = providers.find(provider => provider.id === providerId);

    if (!user) {
        return res.json('User not found' );
    }
    if (!provider) {
        return res.json( 'Provider not found' );
    }

    user.providerId = providerId;
    res.json({ message: 'User subscribed to provider', user });
});

//TASK-4:

type Meter = {
    meterId: number;
    name: string;
    userId:number;
    readings: Reading[];
  };
  
  type Reading = {
    units: number;
    time: string;
  };
  
let meters: Meter[] = [];

app.get('/meters', (req: Request, res: Response) => {
    res.json(meters)
});


app.post('/meters', (req: Request, res: Response) => {
    const user = users.find(item=>item.id===parseInt(req.body.userId)) 
    
    if(user){
        const userId=user.id
        const name  = req.body.name;
        const meterId = meters.length + 1;
        const newMeter: Meter = {
        meterId,
        name,
        userId,
        readings: []
        };
        meters.push(newMeter);
        res.json( 'Meter created');
    }
    else{
        res.send("User not found")
    }
  });

  app.get('/meters', (req: Request, res: Response) => {
    res.json(meters);
  });

  app.post('/meters/:meterId/readings', (req: Request, res: Response) => {
    const meterId = parseInt(req.params.meterId);
    const { units, time } = req.body;
  
    const meter = meters.find(m => m.meterId === meterId);
  
    if (!meter) {
      return res.json( 'Meter not found' );
    }
    const newReading: Reading = {
      units,
      time
    };
  
    meter.readings.push(newReading);
    res.json({ message: 'Reading added', meter });
  });
  

  app.get('/meters/:meterId/readings', (req: Request, res: Response) => {
    const meterId = parseInt(req.params.meterId);

    const meter = meters.find(m => m.meterId === meterId);


  if (!meter) {
    return res.json( 'Meter not found' );
  }

  res.json(meter.readings);
});



    
// TASK-5:
app.get('/users/:userId/bill',(req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    
    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.json('User not found');
    }

    const provider = providers.find(provider => provider.id === user.providerId);
    if (!provider) {
        return res.json('Provider not found');
    }

    // all meters associated with the user
    const userMeter = meters.find(meter => meter.userId === userId);
    if (!userMeter) {
        return res.json('No meters found for this user');
    }

    // Calculate total units consumed
    const userReadings  = userMeter.readings;
    const totalUnits = userReadings.reduce((sum, reading) => sum + reading.units, 0);
    const amount = totalUnits * (provider ? provider.charge : 0);

    // Calculate the bill
    res.json({ userId: user.id, amount: amount });
});

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`)
})