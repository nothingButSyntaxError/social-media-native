import React, {useEffect, useLayoutEffect, useState} from 'react'
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Platform, Image, Touchable } from 'react-native'
import {ThemeProvider, Avatar, Button} from 'react-native-elements';
import { Feather } from '@expo/vector-icons';
import {auth, db, storage} from '../firebase';
import * as firebase from 'firebase';
import * as ImagePicker from 'expo-image-picker';
import { FlatList, ScrollView } from 'react-native-gesture-handler';
import Axios from 'axios';
import { MaterialIcons } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
import { disableExpoCliLogging } from 'expo/build/logs/Logs';
import {GifSearch} from 'react-native-gif-search';
import { setStatusBarNetworkActivityIndicatorVisible } from 'expo-status-bar';
import { Octicons } from '@expo/vector-icons';
import { setIsEnabledAsync } from 'expo-av/build/Audio';
//import DateTimePickerModal from "react-native-modal-datetime-picker";
//import * as Location from 'expo-location';

function PostScreen({navigation}) {
    const [message, setMessage] = useState('');
    const [image, setImage] = useState('');
    const [photo, setPhoto] = useState('');
    const [dropdownOn, setDropdownOn] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const [gifs, setGifs] = useState([]);
    const [term, updateTerm] = useState('');
    const [showGifsSelector, setShowGifsSelector] = useState(false);
    const [location, setLocation] = useState(null);
    const [eventAdder, setEventAdder] = useState(false);
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState(new Date());
    const [currentUser, setCurrentUser] = useState('');
    const [users, setUsers] = useState([]);
    /*const [video, setVideo] = useState('');
    const [status, setStatus] = useState({});*/

    function pickGif() {
        if (showGifsSelector === true) {
            setShowGifsSelector(false);
        } else {
            setShowGifsSelector(true);
        }
    };

    // Important useEffect to get the user from the db 
    // The useEffect gets the user from the db and not from the authentication
    // This is still in beta mode
    useEffect(() => {
        db.collection('users').onSnapshot(snapshot => (
            snapshot.docs.map(doc => {
                if (doc.data().email === user.email) {
                    setCurrentUser(doc.id);
                } else {
                    return;
                }
            })
        ))
    }, [])

    //The current User!
    const user = firebase.auth().currentUser;

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    alert('We need camera and Image Acces!!!');
                }
            }
        })
    }, []);

    //Change the title of the naviagtion pane and add a send button in the right side of the pane!
    useLayoutEffect(() => {
        navigation.setOptions({
            title: 'Send Post',
        });
    }, [navigation])

    // Some important vars.
    let res;
    let blob;

    //A function for picking the image!
    async function pickImage() {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [7, 10],
            quality: 1,
        })
        console.log(result);
    
        if (!result.cancelled) {
            let newFile = {
                 uri: result.uri,
                 type: `test/${result.uri.split('.')[1]}`,
                 name: `test.png`
            }
	        res = await fetch(result.uri);
	        blob = await res.blob();
            setPhoto(newFile);// I CAN SET THE PHOTO AS NEWFILE AND THEN SBMERGE THE FUNCTIONS OF HANDLEUPLOAD AND SENDPOST!!
            setImage(result.uri);        
        }
    };

   
    //function for sending the post not working properly as expected!!!!!
    function sendPost(){
        if (photo !== '') {
            const data = new FormData();
            data.append('file', photo);
            data.append('upload_preset', 'pfrzfrnr');
            data.append('cloud_name' ,'dyin2a2pd');
            fetch('https://api.cloudinary.com/v1_1/dyin2a2pd/image/upload/', {
                method: 'post',
                body: data
            }).then(res => res.json()).
            then(data => {
                db.collection('posts').add({
                    user: user.displayName,
                    email: user.email,
                    message: message,
                    image: data.secure_url,
                    timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                    profilePic: user.photoURL,
                    likes: 0,
                    userId: currentUser,
                })
            })
            navigation.navigate('Home');
        } else if (photo === '') {
            db.collection('posts').add({
                user: user.displayName,
                email: user.email,
                message: message,
                image: image,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                profilePic: user.photoURL,
                likes: 0,
                userId: currentUser,
            })
            navigation.navigate('Home');
        } else {
            db.collection('posts').add({
                user: user.displayName,
                email: user.email,
                message: message,
                timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
                profilePic: user.photoURL,
                likes: 0,
                userId: currentUser,
            })
            navigation.navigate('Home');
        }
    }

    function addPhotoWithLink() {
        if (dropdownOn === true) {
            setDropdownOn(false);
        } else {
            setDropdownOn(true);
        }
    };

    function submitPhotoUrl() {
        setImage(urlInput);
    };

    function addEvent() {
        setEventAdder(true);
    }; 

    return (
        <ScrollView style={{flexDirection: 'column', display: 'flex'}} contentContainerStyle={{justifyContent: 'flex-start'}}>
            <View style={{backgroundColor: 'black', flexDirection: 'row', width: '100%', height: 50, justifyContent: 'space-evenly'}}>
                <TouchableOpacity style={styles.sidebarIcon} onPress={pickImage}>
                    <MaterialIcons name='monochrome-photos' size={40} color='#AEE8F5' />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sidebarIcons} onPress={pickGif}>
                    <MaterialIcons name='gif' size={40} color='#AEE8F5' />
                </TouchableOpacity>
                <TouchableOpacity style={styles.sidebarIcons} onPress={addEvent}>
                    <MaterialIcons name='event' color='#AEE8F5' size={40} />
                </TouchableOpacity>
                <TouchableOpacity onPress={addPhotoWithLink}>
                    <Entypo name='link' size={40} color='#AEE8F5' />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Entypo name='location-pin' color='#AEE8F5' size={40} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <Octicons name='mention' color='#AEE8F5' size={37} />
                </TouchableOpacity>
            </View>
            {dropdownOn === true ? <View style={{flexDirection: 'row'}}>
                {dropdownOn === true ? <TextInput style={{borderWidth: 1, margin: 5, borderRadius: 10, height: 40, flex: 1}} value={urlInput} onChangeText={text => setUrlInput(text)} placeholder='Photo Url With Url (.png, .jpeg at end)' /> : null}
                <Button style={{width: 100, }} title='Submit' onPress={submitPhotoUrl} />
            </View> : null}
            {showGifsSelector === true ? <ScrollView>
                <GifSearch giphyApiKey='nWaLbyx0caR5OGDeIrdpXKPnRwVTlwMG'
                    gifsToLoad={20}
                    maxGifsToLoad={25}
                    style={{backgroundColor: 'white', borderWidth: 3, borderRadius: 10}}
                    textInputStyle={{fontWeight: 'bold', color: 'black'}}
                    gifListStyle={{height:320}}
                    gifStyle={{height:160}}
                    loadingSpinnerColor={'black'}
                    placeholderTextColor={'grey'}
                    placeholderText={'Search'}
                    darkGiphyLogo={true}
                    onGifSelected={(gif_url) => {setImage(gif_url)}}
                    developmentMode={false}
                    horizontal={false}
                    showScrollBar={false}
                    onError={(error) => {console.log(error)}}
                />
            </ScrollView>: null}
            {eventAdder === true ? (
                <View>
                    <TextInput placeholder='Event Name' style={{borderWidth: 0.5, height: 40, margin: 5, borderRadius: 5}} value={eventName} onChangeText={text => setEventName(text)} />
                </View>
            ) : null}
            <View style={{ flexDirection: 'row', borderColor: 'black', margin: 5, }}>
                <Avatar rounded size={50} source={{uri: user.photoURL}} />
                <Text style={{paddingTop: 4, marginLeft: 2, fontSize: 16}}>{user.displayName}</Text>
                <TouchableOpacity onPress={sendPost} style={{marginLeft: 200}}>
                    <Feather name='send' size={35} color='black' />
                </TouchableOpacity>
            </View>
            <View style={{flexDirection: 'column', marginTop: 30, }}>
                <TextInput onChangeText={text => setMessage(text)} style={{textAlignVertical: 'top', fontSize: 20, flex: 1, flexDirection: 'row', height: 50}} value={message} multiline={true} placeholder='Tell Your Friends Whats Going On' />
                {image !== '' ? <Image source={{uri: image}} style={{height: 300, width: 380}} /> : null}
            </View>
        </ScrollView>
    )
};

export default PostScreen;

const styles = StyleSheet.create({
	sidebarIcons: {
		margin: 3,
	}
})
