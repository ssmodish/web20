import React, { Component } from "react";
import { connect } from "react-redux";
import { Card, Row, Col, Button, Table, Form, Input } from "antd";
import { Link } from "react-router-dom";

class AttendanceReport extends Component{
    state = {
        students: this.props.students, loaded: false, notes: "",
    };
    
    componentDidMount(){
        if( this.props.students && !this.state.loaded ){
            let keys = Object.keys( this.props.students );
            for( let i = 0; i < keys.length; i++ ){
                this.props.students[ keys[ i ] ].isPresent = false;
            }
            this.setState( {
                students: this.props.students, loaded: true,
            } );
        }
    }
    
    componentWillUpdate( nextProps, nextState, nextContext ){
        if( nextProps.students && !nextState.loaded ){
            let keys = Object.keys( nextProps.students );
            
            for( let i = 0; i < keys.length; i++ ){
                nextProps.students[ keys[ i ] ].isPresent = false;
            }
            this.setState( {
                students: nextProps.students, loaded: true,
            } );
        }
    }
    
    notesChange = e => {
        this.setState( { notes: e.target.value } );
    };
    
    onChange = id => {
        
        this.setState( state => {
            let student = state.students.filter( student => student.id === id );
            student[ 0 ].isPresent = !student[ 0 ].isPresent;
            return { students: [ ...state.students ] };
        } );
    };
    
    getAttendanceLink = () => {
        if( this.props.user ){
            let url = `https://airtable.com/shrEawWXvMldYbm5Q?prefill_Project+Manager=${ this.props.user.firstName.trim() }+${ this.props.user.lastName.trim() }+(${ this.props.user.cohort })&prefill_Section=WEB20&prefill_Present+Students=`;
            if( this.state.students ){
                let keys = Object.keys( this.state.students );
                let notPresentString = "&prefill_Absent+Students=";
                if( keys.length > 0 ){
                    let afterFirstIsPresent = false;
                    let afterFirstNotPresent = false;
                    for( let i = 0; i < keys.length; i++ ){
                        if( this.state.students[ keys[ i ] ].isPresent ){
                            if( afterFirstIsPresent ){
                                url += ",";
                            }
                            url += `${ this.state.students[ keys[ i ] ].firstName.trim() }+${ this.state.students[ keys[ i ] ].lastName.trim() }`;
                            if( !afterFirstIsPresent ){
                                afterFirstIsPresent = true;
                            }
                        }else{
                            if( afterFirstNotPresent ){
                                notPresentString += ",";
                            }
                            notPresentString += `${ this.state.students[ keys[ i ] ].firstName.trim() }+${ this.state.students[ keys[ i ] ].lastName.trim() }`;
                            if( !afterFirstNotPresent ){
                                afterFirstNotPresent = true;
                            }
                        }
                    }
                    
                    if( notPresentString !== "&prefill_Absent+Students=" ){
                        url += notPresentString;
                    }
                }
            }
            
            if( this.state.notes !== "" ){
                let notes = encodeURI( this.state.notes );
                url += `&prefill_Notes=${ notes }`;
            }
            
            return url;
        }
    };
    
    render(){
        
        return ( <div style={ { maxWidth: "800px", margin: "20px auto" } }>
            <Card>
                <Row>
                    <Col span={ 24 }>
                        <h1>Attendance Report</h1>
                        <Link to={ "/" }>
                            <Button>Back</Button>
                        </Link>
                        <Table
                            dataSource={ this.state.students }
                            style={ { marginTop: "30px" } }
                            bordered
                            loading={ this.props.isLoading }
                            pagination={ false }>
                            <Table.Column
                                title="First Name"
                                dataIndex="firstName"
                                key="firstName"
                            />
                            <Table.Column
                                title="Last Name"
                                dataIndex="lastName"
                                key="lastName"
                            />
                            <Table.Column title="Attendance"
                                          key="attendance"
                                          render={ ( text, record ) => {
                                
                                              return ( <Button.Group
                                                  size={ "large" }>
                                                  <Button
                                                      onClick={ () => this.onChange(
                                                          record.id ) }
                                                      style={ record.isPresent ?
                                                          { backgroundColor: "#91d5ff" } :
                                                          {} }>
                                                      Present
                                                  </Button>
                                                  <Button
                                                      onClick={ () => this.onChange(
                                                          record.id ) }
                                                      type={ "normal" }
                                                      style={ !record.isPresent ?
                                                          { backgroundColor: "#fffb8f" } :
                                                          {} }>
                                                      Not Present
                                                  </Button>
                                              </Button.Group> );
                                          } }/>
                        </Table>
                        <Form>
                            <Input
                                type="text"
                                placeholder="Notes"
                                name="notes"
                                onChange={ this.notesChange }
                            />
                        </Form>
                        <a
                            className="btn btn-success mt-3"
                            target="_blank"
                            href={ this.getAttendanceLink() }>
                            Submit Attendance
                        </a>
                    </Col>
                </Row>
            </Card>
        </div> );
    }
}

const mpts = state => ( {
    students: state.students.students,
    uid: state.auth.uid,
    user: state.auth.user,
} );

export default connect( mpts, {}, )( AttendanceReport );
