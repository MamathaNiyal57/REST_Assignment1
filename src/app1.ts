import express, { Request, Response} from "express";

const app = express()
const port =  3000

app.use(express.json());

//TASK-1:

type User = {
    id: number;
    username: string;
    password: number;
    email: string;
    fullname: string;
    providerId?: number;
}

let users: User[] = [];

// To get the user array
app.get('/users', (req: Request, res: Response)=> {
    res.json(users);
})

//POST operation:

app.post('/users', (req: Request, res: Response)=>{
    const id  = users.length + 1;
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
    // console.log(req.body);
    res.send("User created");

});

//Get user by id:
app.get('/users/:id', (req: Request, res: Response) =>{
    const id = parseInt(req.params.id);
    const user = users.find(user => user.id ===id);

    if(user){
        res.send(user);
    }else{
        res.json("user not found");
    }
} );

//PUT :
app.put('/users/:id', (req: Request, res: Response)=>{

    const id = parseInt(req.params.id);
    const username = req.body.username;
    const password = req.body.password;
    const email = req.body.email;
    const fullname = req.body.fullname;

    let user = users.find(user => user.id === id);

    if(user){
        user = {...user,...req.body}
        res.send(user);
        
    }else{
        res.json("user not found");
    }
});

//DELETE:
app.delete('/users/:id', (req: Request, res: Response) => {

    const id =parseInt(req.params.id);
    const { username, password, email, fullname} = req.body;

    
    const userIndex =  users.findIndex(user => user.id === id);
    if(userIndex){
        users.splice(userIndex, 1);
        res.json("user deleted successfully");

    }else{
        res.json("user not found");
    }

});

app.listen(port, () => {
    console.log(`server is running on port http://localhost:${port}`)
})

//TASK-2:
type Provider ={
    id: number;
    name: string;
    charge: number;
};

let providers: Provider[] = [];

app.get('/providers', (req, res) => {
    res.json(providers)
});

app.post('/providers', (req: Request, res: Response) =>{
    const id = providers.length +1 ;
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
app.get('/providers/:id', (req:Request, res: Response) =>{
    const id = parseInt(req.params.id);

    const provider = providers.find(provider => provider.id === id);

    if(provider){
        res.json(provider);
    }else{
        res.json('user not found');
    }
});



app.delete('/providers/:id', (req:Request, res: Response)=> {
    const id = parseInt(req.params.id);
    providers = providers.filter(provider => provider.id !== id);
    res.json('provider deleted');
});

//TASK-3:

app.post('/users/:userId/subscribe', (req: Request, res:Response) =>{
    const userId = parseInt(req.params.id);
    const providerId = req.body.providerId;

    const user = users.find(user => user.id ===userId);
    const provider = providers.find(provider => provider.id === providerId);

    if(!user){
        return res.json('user not found');
    }
    if(!provider){
        return res.json('provider not found');
    }

    user.providerId = providerId;
    res.json({ message: 'User subscribed to provider', user });
    
});

//TASK-4:

type Meter ={
    meterId: number;
    name: string;
    userId: number;
    readings: Readings[];
};
type Reading = {
    unit: number;
    time: string:
};



