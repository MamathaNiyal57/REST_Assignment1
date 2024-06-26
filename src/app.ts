import express, { Request, Response } from "express";


const app = express()
const port = 3000


app.use(express.json());


//TASK-1:
type  roles ="user"|"admin"
type User = {
    id:number,
    username:string,
    password:string,
    email:string,
    fullname:string,
    providerId?:number
    role?: roles;
}
type UserDTO = {
    id: number,
    username: string,
    email: string,
    fullname: string,
    providerId?: number,
    role?: roles;

};

let users:User[] = [];

// app.get('/users', (req, res) => {
//     res.json(users)                        
// });


//Task-7:

const rateLimit = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 10;

const requestCounts: { [key: string]: { count: number; startTime: number } } = {};

const rateLimiter = (req: Request, res: Response, next: Function) => {
    const userId = req.params.id;
    const currentTime = Date.now();

    if (!requestCounts[userId]) {
        requestCounts[userId] = { count: 1, startTime: currentTime };
    } else {
        const timeElapsed = currentTime - requestCounts[userId].startTime;

        if (timeElapsed < rateLimit) {
            if (requestCounts[userId].count >= maxRequestsPerWindow) {
                return res.json( "Too many requests" );
            } else {
                requestCounts[userId].count += 1;
            }
        } else {
            requestCounts[userId] = { count: 1, startTime: currentTime };
        }
    }

    next();
};

app.use('/',rateLimiter);
app.post('/users', (req: Request, res: Response) => {
    const id = users.length +1;
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fullname = req.body.fullname;
    const role =  req.body.role;

    const newUser = {
        "id": id,
        "username": username,
        "password": password,
        "email": email,
        "fullname": fullname,
        "role" : role

    }
    users.push(newUser);
    console.log(req.body);
    res.send('hello')

});


const Authentication = (req:Request, res:Response,next: Function)=>{
    const username = req.body.username;
    const password = req.body.password;
    const id=req.params.id
    if(!username && !password){
        return res.status(401).json({
            error: 'username and password are required',
            
        });
    }
    const user = users.find(u=> u.username === username && u.password === password);
    if(!user){
        return res.status(403).json({
            error: 'Invalid username or password'
        });
    }
    console.log(user.id)
    console.log(id)
    if(user.id===parseInt(id)){
       // console.log("cameinside");
        next();
    }
    else{
        res.status(404).send("Not Found");
        //console.log("yes");
    }
};

//Middleware to check if user is admin
const isAdmin =(req:Request, res:Response, next: Function) =>{
    //console.log("Hi")
    const role = req.headers['role']
    // console.log(req.body.role)
    if(role != "admin"){
        return res.json('Admin access required');
    }
    next();
};


// Accessible only to admin
app.get('/users', isAdmin, (req, res) => {
    const userDTOs: UserDTO[] = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        providerId: user.providerId,
        role: user.role
    }));
    res.json(userDTOs);
});

//accessible only to authenticated user
app.get('/users/:id', Authentication,  (req,res) => {
    const userId = parseInt(req.params.id);
    // if(req.body.id !== userId){
    //     return res.json('Access denied');
    // }
    
    const user = users.find(u => u.id === userId);
    if(!user) {
        return res.json('User not found');
    
    }
    const userDTO: UserDTO = {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        providerId: user.providerId,
        role: user.role
    };

    res.json(userDTO);

});
                                                                                                    

// update user information for given id 
app.put('/users/:id',Authentication,(req: Request, res:Response) => {
   
    const id = parseInt(req.params.id);
    let user = users.find(user => user.id === id);

    if(user){
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
app.delete('/users/:id', Authentication, (req: Request, res: Response) => {

    const id = parseInt(req.params.id);
    // const { username, password, email, fullname} = req.body;

    const userIndex =  users.findIndex(user => user.id === id);
    if(userIndex !== -1){
        users.splice(userIndex, 1);
        res.json("user deleted successfully");

    }else{
        res.json("user not found");
    }
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

    // Calculating total units consumed
    const userReadings  = userMeter.readings;
    const totalUnits = userReadings.reduce((sum, reading) => sum + reading.units, 0);
    const amount = totalUnits * (provider ? provider.charge : 0);

    // Calculating the bill
    res.json({ userId: user.id, amount: amount });
});



//Part-2 task-2 

function calculateUnitsConsumed(readings: Reading[], startDate: Date, endDate: Date) {
    let totalUnits = 0;
    for (const reading of readings) {

        const readingDate = new Date(reading.time); // converting time of reading to date object
        console.log("readingDate",readingDate);
        if (readingDate >= startDate && readingDate <= endDate) {

            totalUnits += reading.units;
        }
    }
    return totalUnits;
}

app.get('/users/:id/unitsConsumed', Authentication, (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const days = req.query.days ? parseInt(req.query.days as string) : undefined;

    console.log(days)
    if (days === undefined || days <= 0) {
        return res.json( 'Invalid number of days' );
    }

    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.json('User not found');
    }

    const userMeter = meters.find(meter => meter.userId === userId);
    if (!userMeter) {
        return res.json('No meters found for this user');
    }

    const todayDate = new Date();
    // const startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate() - days);
    const startDate = new Date(todayDate.getTime() - days * 24 * 60 * 60 * 1000);
    const endDate = todayDate;
    console.log(startDate, endDate);
    const totalUnits = calculateUnitsConsumed(userMeter.readings, startDate, endDate);

    res.json({ userId, totalUnits });
});



//task -3:

function calculateUnitsConsumedInBillingCycle(readings: Reading[]) {
    
    const todayDate = new Date();
    const startDate = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    const endDate = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0);
    
    let totalUnits = 0;

    for (const reading of readings) {
        const readingDate = new Date(reading.time);
        
        if (readingDate >= startDate && readingDate <= endDate) {
            
                totalUnits += reading.units;
            }
    }
    const chargePerUnit = 0.10;
    const amount = totalUnits * chargePerUnit;

    return amount;

    //return totalUnits;
}
app.get('/users/:userId/bill', Authentication, (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;


    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    
    const userMeter = meters.find(meter => meter.userId === userId);
    if (!userMeter) {
        return res.status(404).json({ error: 'No meters found for this user' });
    }

    const amount = calculateUnitsConsumedInBillingCycle(userMeter.readings);

    res.json({ userId: user.id, amount: amount });
});

//task-4:


function calculateTotalCost(userId: number, providerId: number): number | null {
    const userMeter = meters.find(meter => meter.userId === userId);
    const provider = providers.find(provider => provider.id === providerId);

    if (!userMeter || !provider) {
        return null;
    }

    let totalUnits = 0;
    for (const reading of userMeter.readings) {
        totalUnits += reading.units;
    }

    const totalCost = totalUnits * provider.charge;
    return totalCost;
}
// Endpoint to get top 3 providers with least cost
app.get('/users/:userId/topProviders', (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);


    const providerCosts: { providerId: number, totalCost: number }[] = [];

    // Calculating total cost for each provider and store in providerCosts array
    for (const provider of providers) {
        const totalCost = calculateTotalCost(userId, provider.id);
        if (totalCost !== null) {
            providerCosts.push({ providerId: provider.id, totalCost });
        }
    }


    for (let i = 0; i < providerCosts.length - 1; i++) {
        for (let j = i + 1; j < providerCosts.length; j++) {
            if (providerCosts[i].totalCost > providerCosts[j].totalCost) {
                const temp = providerCosts[i];
                providerCosts[i] = providerCosts[j];
                providerCosts[j] = temp;
            }
        }
    }

    // Extract top 3 providers
    const topProviders: { id: number, name: string, charge: number, totalCost: number }[] = [];
    for (let i = 0; i < Math.min(3, providerCosts.length); i++) {
        const provider = providers.find(p => p.id === providerCosts[i].providerId);
        if (provider) {
            topProviders.push({
                id: provider.id,
                name: provider.name,
                charge: provider.charge,
                totalCost: providerCosts[i].totalCost
            });
        }
    }


    res.json(topProviders);
});



//task-5:

app.get('/users', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5; // Default limit to 5 users
    const page = parseInt(req.query.page as string) || 1;   // Default page to 1

    const offset = (page - 1) * limit;
   
    const paginatedUsers = users.slice(offset, offset + limit);

    res.json({
        users: paginatedUsers,
        currentPage: page,
        totalPages: Math.ceil(users.length / limit)
    });
});



                                                                                               

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});