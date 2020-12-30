import React, { Component } from 'react';
import axios from 'axios';

class Main extends Component {

   
    state = { 
  
      // Initially, no file is selected 
      selectedFile: null
    }; 
     
    // On file select (from the pop up) 
    onFileChange = event => { 
     
      // Update the state 
      this.setState({ selectedFile: event.target.files[0] }); 
     
    }; 
     
    // On file upload (click the upload button) 
    onFileUpload = () => { 
     
      // Create an object of formData 
      const formData = new FormData(); 
     
      // Update the formData object 
      formData.append( 
        "myFile", 
        this.state.selectedFile, 
        this.state.selectedFile.name 
      ); 
     
      // Details of the uploaded file 
      console.log(this.state.selectedFile); 
     
      // Request made to the backend api 
      // Send formData object 
      axios.post("http://localhost:3000/upload.php", formData); 
    }; 
     
    // File content to be displayed after 
    // file upload is complete 
    fileData = () => { 
     
      if (this.state.selectedFile) { 
          
        return ( 
          <div> 
            <img src={this.state.selectedFile} alt="img" width="320px" height="400px"/>
            <h2>File Details:</h2> 
            <p>File Name: {this.state.selectedFile.name}</p> 
            <p>File Type: {this.state.selectedFile.type}</p> 
            <p> 
              Last Modified:{" "} 
              {this.state.selectedFile.lastModifiedDate.toDateString()} 
            </p> 
          </div> 
        ); 
      } else { 
        return ( 
          <div> 
            <br /> 
            <h4>Choose before Pressing the Upload button</h4> 
          </div> 
        ); 
      } 
    }; 
     
  constructor(props) {
    super(props);
    this.state = {
      image: null
    };

    this.onImageChange = this.onImageChange.bind(this);
  }

  onImageChange = event => {
    if (event.target.files && event.target.files[0]) {
      let img = event.target.files[0];
      this.setState({
        image: URL.createObjectURL(img)
      });
    }
  };
   saveDynamicDataToFile() {
    var userInput = document.getElementById("myText").value;

    var blob = new Blob([userInput], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "dynamic.txt");
  };

  render() {
    return (
      
      
      <div id="content">
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <a
          className="navbar-brand col-sm-3 col-md-2 mr-0"
          href="http://www.dappuniversity.com/bootcamp"
          target="_blank"
          rel="noopener noreferrer"
        >
          Portrait Online Marketplace
        </a>
        
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-white"><span id="account">{this.props.account}</span></small>
          </li>
        </ul>
      </nav>

        <h1>Add Portrait</h1>
        <form action="upload.php" onSubmit={(event) => {
          event.preventDefault()
          const name = this.portraitName.value
          const price = window.web3.utils.toWei(this.portraitPrice.value.toString(), 'Ether')
          this.props.createPortrait(name, price)
        }}>
          <div className="form-group mr-sm-2">
            <input
              id="myFile"
              type="file"
              ref={(input) => { this.portraitName = input }}
              onChange={this.onImageChange} 
              className="form-control"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="portraitName"
              type="text"
              ref={(input) => { this.portraitName = input }}
              className="form-control"
              placeholder="Portrait Name"
              required />
          </div>
          <div className="form-group mr-sm-2">
            <input
              id="portraitPrice"
              type="text"
              ref={(input) => { this.portraitPrice = input }}
              className="form-control"
              placeholder="Portrait Price"
              required />
          </div>
          <button type="submit" className="btn btn-primary">Add Portrait</button>
        </form>
           
        <p>&nbsp;</p> 
        <h2>Buy Portrait</h2>
        
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Name</th>
              <th scope="col">Price</th>
              <th scope="col">Owner</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="portraitList">
            { this.props.portraits.map((portrait, key) => {
              return(
                <tr key={key}>
                  <th scope="row">{portrait.id.toString()}</th>
                  <td>{portrait.name}</td>
                  <td>{window.web3.utils.fromWei(portrait.price.toString(), 'Ether')} Eth</td>
                  <td>{portrait.owner}</td>
                  <td>
                    { !portrait.purchased
                      ? <button
                          name={portrait.id}
                          value={portrait.price}
                          onClick={(event) => {
                            this.props.purchasePortrait(event.target.name, event.target.value)
                          }}
                        >
                          Buy
                        </button>
                      : null
                    }
                    </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      
    );
  }
}

export default Main;
